const express = require('express');
const cors = require('cors');
const employeesRouter = require('./routes/employees.routes');

const app = express();

// In local dev, only allow the Vite dev server origin.
// Inside Docker, the browser only ever talks to nginx (same origin),
// so CORS isn't even exercised there — but it's harmless to leave on.
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));

app.use(express.json());

// Used by docker-compose healthchecks and by you, to sanity-check the API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/employees', employeesRouter);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
