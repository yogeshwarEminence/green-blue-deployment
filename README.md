# Team Directory — 3-Tier Demo App

A minimal reference app split into the classic three tiers:

- **Presentation** — React (Vite) single-page app in `client/`
- **Application/Logic** — Express REST API in `server/`
- **Data** — PostgreSQL, schema in `database/schema.sql`

The page lists users and supports full CRUD (Create, Read, Update, Delete),
all backed by real Postgres rows through the API.

```
three-tier-app/
├── database/
│   └── schema.sql       # users table + seed rows
├── server/               # Express API (port 4000)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── client/               # React app (port 5173)
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 1. Set up PostgreSQL

Create a database and load the schema (adjust user/db name as you like):

```bash
createdb threetierapp
psql -U postgres -d threetierapp -f database/schema.sql
```

The server will also auto-create the `users` table on startup if it's
missing, but running `schema.sql` gives you the seeded demo rows.

## 2. Run the API server

```bash
cd server
cp .env.example .env   # edit with your Postgres credentials if needed
npm install
npm run dev             # or: npm start
```

The API listens on `http://localhost:4000` and exposes:

| Method | Route            | Description        |
|--------|------------------|---------------------|
| GET    | /api/users       | List all users      |
| POST   | /api/users       | Create a user        |
| PUT    | /api/users/:id   | Update a user        |
| DELETE | /api/users/:id   | Delete a user        |

## 3. Run the React client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` calls to the server
at `http://localhost:4000`, so both pieces work together with no extra
CORS setup needed in development.

## Notes

- This is a deliberately small "dummy" app meant as a starting point —
  no auth, no pagination, no tests. Extend as needed.
- To point the client at a different API origin (e.g. in production),
  update the proxy target in `client/vite.config.js` or swap the fetch
  calls in `client/src/App.jsx` to use an absolute URL / env variable.
