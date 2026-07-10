const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/employees - list all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, department FROM employees ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employees - create a new employee
router.post('/', async (req, res) => {
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res
      .status(400)
      .json({ error: 'name, email and department are all required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employees (name, email, department)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, department`,
      [name, email, department]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating employee:', err.message);
    if (err.code === '23505') {
      // unique_violation (duplicate email)
      return res.status(409).json({ error: 'An employee with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT /api/employees/:id - update an existing employee
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res
      .status(400)
      .json({ error: 'name, email and department are all required' });
  }

  try {
    const result = await pool.query(
      `UPDATE employees
       SET name = $1, email = $2, department = $3
       WHERE id = $4
       RETURNING id, name, email, department`,
      [name, email, department, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating employee:', err.message);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id - remove an employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting employee:', err.message);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;
