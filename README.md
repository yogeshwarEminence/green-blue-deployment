# Employee Management Demo

A deliberately small full-stack app for learning **Docker, Docker Compose,
AWS, Application Load Balancer, and Blue-Green Deployment**. It does one
thing — CRUD on employees — so the infrastructure around it stays the
focus.

**Stack:** React (Vite) → Express → PostgreSQL, each running in its own
container.

## Quick start

```bash
docker compose up --build
```

Then open **http://localhost**. That's it — one command, one URL.

---

## 1. Project structure

```
employee-management-demo/
├── docker-compose.yml
├── database/
│   └── schema.sql              # employees table + 5 seed rows
├── server/                     # backend (Express API)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example             # only used outside Docker
│   ├── package.json
│   └── src/
│       ├── server.js            # entry point: waits for DB, then listens
│       ├── app.js                # express app + middleware + routes
│       ├── db/
│       │   ├── pool.js           # pg connection pool
│       │   └── ensureSchema.js   # safety-net table creation
│       ├── controllers/
│       │   └── employees.controller.js
│       └── routes/
│           └── employees.routes.js
└── client/                     # frontend (React + Vite)
    ├── Dockerfile               # multi-stage: build with Node, serve with nginx
    ├── .dockerignore
    ├── nginx.conf                # serves the SPA + proxies /api to backend
    ├── .env.development          # only used by `npm run dev`
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                # all CRUD UI + loading/error states
        ├── App.css
        ├── index.css
        └── api.js                 # decides the API base URL
```

This mirrors a real production layout on purpose: `server/src` separates
routes from controllers from the database layer, and `client` builds to
static files served by nginx — not a dev server. That's the same shape
you'll deploy to EC2 behind an ALB later.

---

## 2. How Docker works here

Three services, three containers, one `docker-compose.yml`:

| Service    | Built from      | Exposed on host | Role                              |
|------------|------------------|------------------|------------------------------------|
| `postgres` | `postgres:16-alpine` (official image) | `5432` | Stores employee data |
| `backend`  | `./server/Dockerfile` | `4000` | Express REST API |
| `frontend` | `./client/Dockerfile` (multi-stage) | `80` | Serves the React app via nginx |

`docker compose up --build` builds the `backend` and `frontend` images
from their Dockerfiles, pulls the official `postgres` image, then starts
all three in dependency order:

1. `postgres` starts, and a healthcheck (`pg_isready`) waits until it's
   actually ready to accept connections — not just "container running."
2. `backend` starts only after that healthcheck passes, then itself
   waits (with a short retry loop) for the database before listening.
3. `frontend` starts after `backend`.

### The frontend Dockerfile is multi-stage

```
Stage 1 (node:20-alpine): npm install, npm run build  → produces /app/dist
Stage 2 (nginx:alpine):   copies dist/ into nginx, serves it on port 80
```

The final image contains **no Node.js, no source code, no node_modules**
— just compiled static files and nginx. That's a much smaller, more
secure image to actually deploy, and it's the standard pattern for
React apps in production.

### The backend uses `npm start`, not a dev server

`server/Dockerfile` runs `npm start` → `node src/server.js`. No nodemon,
no watch mode — a plain, stable Node process, exactly what you'd want
running in an EC2 instance or behind an ALB.

---

## 3. How the frontend talks to the backend

This is the part most Docker tutorials get subtly wrong, so it's worth
explaining directly.

**The browser runs the React app, not the frontend container.** Once
nginx serves `index.html` and the JS bundle to your browser, that
JavaScript executes on *your machine*, not inside Docker. That means it
**cannot** resolve Docker service names like `http://backend:4000` —
those hostnames only exist on the internal Docker network, which your
browser has no access to.

So instead of hardcoding a backend hostname into the browser-side code,
this project uses the standard fix: **nginx acts as a reverse proxy.**

```
Browser  ──►  http://localhost/api/employees
                       │
                (nginx, inside the frontend container)
                       │
                       ▼
              http://backend:4000/api/employees
                       │
                (backend container, on the Docker network)
```

- The browser only ever talks to `http://localhost` (port 80) — same
  origin as the page itself, so there's no CORS to worry about and no
  Docker hostname to resolve.
- `client/nginx.conf` forwards any request under `/api/` to
  `http://backend:4000/api/`, using the Docker service name `backend`
  — because nginx *is* running inside the Docker network, it can
  resolve that name just fine.
- `client/src/api.js` defaults to the relative path `/api` when no
  `VITE_API_URL` is set at build time, which is exactly the case for
  the Docker build (see `client/Dockerfile`).

**For local development** (`npm run dev`, not in Docker), there's no
nginx in front of the Vite dev server, so `client/.env.development`
points `VITE_API_URL` straight at `http://localhost:4000/api` — assuming
you have the backend running (either via `docker compose up` and using
its published `4000` port, or `npm run dev` inside `server/`).

This is also exactly the shape you want for **Blue-Green Deployment**
later: the browser always calls one stable, public address (eventually
your ALB), and *that* address is what gets swapped between "blue" and
"green" backend targets — never something baked into client-side
JavaScript.

---

## 4. How the backend talks to PostgreSQL

`server/src/db/pool.js` creates a `pg` connection pool from five
environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME`. The code never hardcodes a hostname — it just reads these:

- **Inside Docker:** `docker-compose.yml` sets `DB_HOST=postgres`, the
  service name of the database container. Docker Compose gives every
  service a DNS entry on the shared network, so `postgres` resolves to
  the right container IP automatically.
- **Outside Docker** (`npm run dev` in `server/`): copy
  `server/.env.example` to `server/.env` and set `DB_HOST=localhost`
  instead, pointing at Postgres running via `docker compose up postgres`
  (its port `5432` is published to your host) or a local install.

`server/src/server.js` also retries the initial DB connection a few
times before giving up, so a slightly slow-starting Postgres container
doesn't crash the backend on startup.

---

## 5. Docker network explanation

`docker-compose.yml` defines one custom bridge network:

```yaml
networks:
  employee-network:
    driver: bridge
```

All three services join it. On a Compose-managed network, **the service
name IS the hostname** — no manual IP configuration, no `/etc/hosts`
editing. That's why `backend` can reach Postgres at `postgres:5432`, and
`frontend` (nginx) can reach the API at `backend:4000`.

Only two ports are published to your actual machine (`ports:` in
compose): `80` (frontend) and `4000` (backend, for convenience during
development) and `5432` (Postgres, likewise). Everything else — the
`backend` ↔ `postgres` traffic — stays entirely inside the Docker
network and is never exposed to the outside world. That's good practice
and it's also how you'll want things wired once there's a real ALB in
front of this instead of your laptop's `localhost`.

---

## 6. Volumes explanation

```yaml
volumes:
  postgres-data:
```

This is a **named volume**, managed by Docker rather than living in
your project folder. It's mounted into the `postgres` container at
`/var/lib/postgresql/data` — the exact path where PostgreSQL stores its
actual data files.

Why this matters: containers are disposable. Every time you
`docker compose down` and `up` again, you get a **fresh** `postgres`
container — but as long as the named volume still exists, its data
survives, because the volume lives independently of the container's
lifecycle.

- `docker compose down` — stops and removes containers, **keeps** the
  volume (your data survives).
- `docker compose down -v` — also deletes the volume (data is gone,
  next startup reseeds from `schema.sql` on a clean slate).

The other mount in `docker-compose.yml`,
`./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql`, is a
**bind mount** (a file from your project folder, not a named volume).
The official Postgres image automatically runs any `.sql` file it finds
in `/docker-entrypoint-initdb.d/` — but **only the first time**, when
the data directory is empty. That's how the `employees` table and its 5
seed rows get created automatically on a fresh `docker compose up`.

---

## 7. API reference

| Method | Route                 | Description        |
|--------|-----------------------|---------------------|
| GET    | `/api/health`         | Health check         |
| GET    | `/api/employees`      | List all employees   |
| POST   | `/api/employees`      | Create an employee    |
| PUT    | `/api/employees/:id`  | Update an employee    |
| DELETE | `/api/employees/:id`  | Delete an employee    |

Employee shape: `{ id, name, email, department, created_at }`.

---

## 8. Running without Docker (optional, for backend/frontend dev)

**Backend:**
```bash
cd server
cp .env.example .env   # set DB_HOST=localhost, etc.
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`. Make sure the backend is reachable at
`http://localhost:4000` (either running via Docker with its port
published, or via `npm run dev` above).

---

## 9. Where this goes next

This project is intentionally ready for the next steps in your learning
path:

- **GitHub** — plain files, no build artifacts committed, `.gitignore`
  ready to add (`node_modules`, `dist`, `.env`).
- **EC2 / Jenkins** — `docker compose up --build` is the entire deploy
  step; wire it into a Jenkins pipeline as-is.
- **AWS Application Load Balancer** — point the ALB at the `frontend`
  container's port `80` (or `backend`'s `4000` for API-only routing);
  nothing in the app assumes a specific host.
- **Blue-Green / zero-downtime deployment** — because the browser only
  ever calls one stable address (never a container-internal hostname),
  you can freely stand up a second ("green") stack alongside the first
  ("blue") and switch traffic at the load balancer without touching any
  application code.
