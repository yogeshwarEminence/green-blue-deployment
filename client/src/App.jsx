import React, { useEffect, useMemo, useState } from 'react';
import API_URL from './api';
import './App.css';

const emptyForm = { id: null, name: '', email: '', department: '' };

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function accentFor(name) {
  const palette = ['#2F6F5E', '#B5562F', '#3B5BA5', '#8A5FB0', '#C08A1E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = form.id !== null;

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/employees`);
      if (!res.ok) throw new Error('Could not load employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading employees');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.department.trim()) {
      setError('Name, email, and department are all required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
      };
      const res = await fetch(isEditing ? `${API_URL}/employees/${form.id}` : `${API_URL}/employees`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      if (isEditing) {
        setEmployees((prev) => prev.map((emp) => (emp.id === data.id ? data : emp)));
      } else {
        setEmployees((prev) => [...prev, data]);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Something went wrong while saving');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(employee) {
    setForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm(emptyForm);
    setError('');
  }

  async function handleDelete(id) {
    if (!confirm('Remove this employee?')) return;
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      if (form.id === id) setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Something went wrong while deleting');
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
    );
  }, [employees, query]);

  return (
    <div className="page">
      <header className="hero">
        <span className="eyebrow">Employee Management Demo</span>
        <h1>Employees</h1>
        <p className="hero-sub">
          React client → Express API → PostgreSQL. A small reference app for learning
          Docker, AWS, load balancing, and blue-green deployment.
        </p>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <h2>{isEditing ? `Edit employee #${form.id}` : 'Add an employee'}</h2>
          <form onSubmit={handleSubmit} className="employee-form">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jordan Blake"
                autoComplete="off"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jordan.blake@example.com"
                autoComplete="off"
              />
            </label>
            <label>
              Department
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Engineering"
                autoComplete="off"
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add employee'}
              </button>
              {isEditing && (
                <button type="button" className="btn-ghost" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
            {error && <p className="form-error">{error}</p>}
          </form>
        </section>

        <section className="panel list-panel">
          <div className="list-header">
            <h2>
              {filtered.length} {filtered.length === 1 ? 'employee' : 'employees'}
            </h2>
            <input
              type="search"
              className="search"
              placeholder="Search by name, email, or department"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="status-message">Loading employees…</p>
          ) : filtered.length === 0 ? (
            <p className="status-message">
              {employees.length === 0
                ? 'No employees yet — add the first one using the form.'
                : 'No matches. Try a different search term.'}
            </p>
          ) : (
            <ul className="employee-list">
              {filtered.map((emp) => (
                <li className="employee-row" key={emp.id} style={{ '--accent': accentFor(emp.name) }}>
                  <span className="avatar">{initials(emp.name)}</span>
                  <div className="employee-info">
                    <span className="employee-name">{emp.name}</span>
                    <span className="employee-email">{emp.email}</span>
                  </div>
                  <span className="department-badge">{emp.department}</span>
                  <div className="row-actions">
                    <button className="btn-ghost small" onClick={() => startEdit(emp)}>
                      Edit
                    </button>
                    <button className="btn-danger small" onClick={() => handleDelete(emp.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="foot">React → Express → PostgreSQL</footer>
    </div>
  );
}
