# Employee Management Demo

A deliberately simple full-stack CRUD application built to **learn Docker,
AWS, Application Load Balancers, and Blue-Green Deployment** — not to be a
feature-rich product. Every design choice favors clarity and Docker best
practices over cleverness.

**Stack:** React (Vite) → nginx · Node.js + Express · PostgreSQL

---

## 1. Project Structure

```
employee-management-demo/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeForm.jsx
│   │   │   └── EmployeeList.jsx
│   │   ├── api.js              # all fetch() calls to the backend live here
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf              # serves the built app in production
│   ├── Dockerfile              # multi-stage: build with Node, serve with nginx
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── employees.js    # GET/POST/PUT/DELETE /api/employees
│   │   ├── db.js               # PostgreSQL connection pool
│   │   └── index.js            # app entry point
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── db/
│   └── schema.sql              # table definition + 5 seed employees
│
├── docker-compose.yml          # wires postgres + backend + frontend together
├── .gitignore
└── README.md
```

This layout is intentionally "production-shaped": `client` and `server` are
independent, independently-buildable Docker images, exactly like you'd want
when later putting each behind its own EC2 Auto Scaling Group / target group
for Blue-Green deployments.

---

## 2. Running It

You need Docker and Docker Compose installed. Then, from the project root:

```bash
docker compose up --build
```

Open **http://localhost** in your browser. That's it — one command, no
manual npm installs, no local Postgres setup.

To stop everything:

```bash
docker compose down          # stops containers, keeps the data volume
docker compose down -v       # also deletes the database volume (fresh seed data next time)
```

### Local (non-Docker) development

If you want hot-reload while coding:

```bash
# terminal 1
cd server && cp .env.example .env && npm install && npm run start

# terminal 2
cd client && cp .env.example .env && npm install && npm run dev
```

Here `DB_HOST=localhost` and `VITE_API_URL=http://localhost:4000` because
nothing is running inside Docker's network — everything is a process on
your own machine, so "localhost" correctly means "this machine."

---

## 3. How Docker Works Here

Each of the three services runs in its own container, defined in
`docker-compose.yml`:

| Service    | Image                          | Purpose                          |
|------------|---------------------------------|-----------------------------------|
| `postgres` | `postgres:16-alpine`            | Stores employee data              |
| `backend`  | built from `server/Dockerfile`  | Express REST API                  |
| `frontend` | built from `client/Dockerfile`  | React app served by nginx         |

Running `docker compose up --build` tells Docker to:
1. Build the `backend` and `frontend` images from their Dockerfiles.
2. Pull the official `postgres` image.
3. Create a shared Docker network (`app-network`) so containers can talk to
   each other by **service name** instead of IP address.
4. Start `postgres` first, wait until it reports healthy (via its
   `healthcheck`), then start `backend`, then `frontend`.

### Multi-stage build (frontend)

`client/Dockerfile` has two stages:

- **Stage 1 (`build`)** uses `node:20-alpine` to run `npm install` and
  `npm run build`, producing static HTML/CSS/JS in `client/dist`.
- **Stage 2** starts fresh from `nginx:1.27-alpine` and copies *only* the
  built `dist` folder into it.

The final image contains nginx + static files — no Node.js, no
`node_modules`, no source code. It's small, fast to start, and this is
exactly how you'd want to serve a frontend in production (and later, behind
an Application Load Balancer).

The backend does **not** need a multi-stage build — it just needs Node.js
to run `npm start`, so a single-stage `node:20-alpine` image is enough.

### `.dockerignore`

Both `client/` and `server/` have a `.dockerignore` so `node_modules`,
`.env` files, and git metadata never get copied into the build context or
baked into an image layer. This keeps images small and avoids accidentally
shipping local secrets.

---

## 4. How the Frontend Talks to the Backend

This is the part people usually get wrong, so it's worth being explicit
about:

**The React app's JavaScript runs in the user's browser — not inside a
Docker container.** Even though the *frontend container* lives on the same
Docker network as the *backend container*, the code that actually executes
(the compiled `.js` files nginx serves) executes on your laptop, outside
Docker entirely. Your browser has no idea Docker's internal network exists
and cannot resolve a hostname like `backend`.

That's why:

- **Inside the Docker network** (container-to-container), things like
  `postgres` work as a hostname — Docker's built-in DNS resolves it.
- **From the browser** (frontend JS → backend API), the address must be one
  the browser's machine can reach. Since `docker-compose.yml` publishes the
  backend's port with `"4000:4000"`, `http://localhost:4000` works from the
  browser because the host machine is genuinely listening there.

So in this project, `VITE_API_URL` is always `http://localhost:4000`,
whether you're running Docker or developing locally — because in both
cases, the *browser* is what's calling the API, and in both cases the API
is reachable on the host machine's port 4000.

Vite bakes `VITE_API_URL` into the compiled JavaScript **at build time**
(browsers can't read a server's environment variables at runtime), which is
why it's passed as a Docker build **argument** in `docker-compose.yml`:

```yaml
frontend:
  build:
    args:
      VITE_API_URL: http://localhost:4000
```

This same pattern is exactly what you'll use later with an Application Load
Balancer: the frontend build will point at the ALB's DNS name instead of
`localhost`, and the ALB will route traffic to whichever backend containers
are currently healthy — which is the foundation of Blue-Green deployment.

---

## 5. How the Backend Talks to PostgreSQL

Unlike the frontend, the **backend genuinely runs inside the Docker
network** (Node.js executes inside the `backend` container, not in a
browser). So it *can* and *should* use the Docker service name:

```js
// server/src/db.js
new Pool({
  host: process.env.DB_HOST, // "postgres" — the service name in docker-compose.yml
  ...
});
```

`docker-compose.yml` sets `DB_HOST: postgres` for the backend container.
Docker's internal DNS resolves `postgres` to the IP address of the
`postgres` container automatically — no hardcoded IPs, no manual network
configuration.

The backend also waits for Postgres to be ready before starting, via:

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

which uses Postgres's `healthcheck` (`pg_isready`) so the backend doesn't
try to connect before the database has finished starting up.

---

## 6. Docker Network Explanation

`docker-compose.yml` defines one custom bridge network:

```yaml
networks:
  app-network:
    driver: bridge
```

All three services join it. A Docker bridge network gives every container:

- Its own internal IP address
- Automatic DNS resolution **by service name** (so `postgres`, `backend`,
  and `frontend` are all valid hostnames from within any container on the
  network)
- Isolation from other Docker networks / projects on the same machine

This is why the backend can connect to `postgres:5432` and why, if you
later add more services, they can all reach each other by name without any
extra configuration — and why *none* of the container-to-container
communication in this project uses `localhost`.

---

## 7. Volumes Explanation

```yaml
volumes:
  - pgdata:/var/lib/postgresql/data
  - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
```

Two different things are happening here:

1. **Named volume (`pgdata`)** — Docker manages this storage outside the
   container's own filesystem. When the `postgres` container is removed and
   recreated (e.g. `docker compose up` again, or a new image version), the
   actual database files in `pgdata` survive. Without this, every
   `docker compose down` would silently wipe all your data.

2. **Bind mount (`./db/schema.sql`)** — this maps a specific file from your
   project folder into the container. The official Postgres image
   automatically runs any `.sql` file it finds in
   `/docker-entrypoint-initdb.d/` **the first time** it starts with an empty
   data directory. That's how the table and 5 seed employees get created
   automatically — you never run a migration command by hand.

If you change `schema.sql` later and want it to re-run, you need to wipe the
volume first: `docker compose down -v`.

---

## 8. API Reference

| Method | Route                  | Body                                   | Description          |
|--------|------------------------|-----------------------------------------|-----------------------|
| GET    | `/api/employees`       | —                                       | List all employees   |
| POST   | `/api/employees`       | `{ name, email, department }`           | Create an employee    |
| PUT    | `/api/employees/:id`   | `{ name, email, department }`           | Update an employee    |
| DELETE | `/api/employees/:id`   | —                                       | Delete an employee    |
| GET    | `/health`              | —                                       | Health check (DB too) |

---

## 9. Where This Goes Next

This project is intentionally structured so that each later step is a small,
additive change rather than a rewrite:

- **GitHub** — push this repo as-is; it's already a normal Node/React repo.
- **EC2** — install Docker on an instance, `git clone`, `docker compose up
  --build`, done.
- **Jenkins** — a pipeline can build and push the `client` and `server`
  images to a registry, then SSH/deploy to EC2.
- **Nginx** — the frontend already uses nginx; the same config style can
  later reverse-proxy or terminate TLS.
- **Application Load Balancer** — point a target group at the `backend`
  containers' port 4000 and another at `frontend`'s port 80; swap
  `VITE_API_URL` to the ALB's DNS name.
- **Blue-Green Deployment** — because `client` and `server` are separate,
  independently built images with no in-container state, you can run a new
  ("green") set of containers alongside the old ("blue") ones and shift the
  ALB's target group traffic over once green passes its health checks.
