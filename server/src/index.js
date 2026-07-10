require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const employeesRouter = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple health check - useful for Docker healthchecks and later
// for the AWS Application Load Balancer's target group health checks.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'unreachable' });
  }
});

app.use('/api/employees', employeesRouter);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
