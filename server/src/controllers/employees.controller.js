const pool = require('../db/pool');

async function listEmployees(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, department, created_at FROM employees ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to list employees:', err.message);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

async function createEmployee(req, res) {
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employees (name, email, department)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, department, created_at`,
      [name, email, department]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An employee with that email already exists' });
    }
    console.error('Failed to create employee:', err.message);
    res.status(500).json({ error: 'Failed to create employee' });
  }
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE employees
       SET name = $1, email = $2, department = $3
       WHERE id = $4
       RETURNING id, name, email, department, created_at`,
      [name, email, department, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An employee with that email already exists' });
    }
    console.error('Failed to update employee:', err.message);
    res.status(500).json({ error: 'Failed to update employee' });
  }
}

async function deleteEmployee(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete employee:', err.message);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
