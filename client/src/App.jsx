import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = '/api/users';
const ROLES = ['Admin', 'Editor', 'Member', 'Viewer'];

const emptyForm = { id: null, name: '', email: '', role: 'Member' };

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

// Deterministic accent color per user, derived from their name.
function accentFor(name) {
  const palette = ['#2F6F5E', '#B5562F', '#3B5BA5', '#8A5FB0', '#C08A1E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = form.id !== null;

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Could not load the directory');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading users');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      const res = await fetch(isEditing ? `${API_BASE}/${form.id}` : API_BASE, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      if (isEditing) {
        setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
      } else {
        setUsers((prev) => [...prev, data]);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Something went wrong while saving');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(user) {
    setForm({ id: user.id, name: user.name, email: user.email, role: user.role });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm(emptyForm);
    setError('');
  }

  async function handleDelete(id) {
    if (!confirm('Remove this person from the directory?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (form.id === id) setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Something went wrong while deleting');
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div className="page">
      <header className="hero">
        <span className="eyebrow">Directory · Tier 1 of 3, React client</span>
        <h1>Team Directory</h1>
        <p className="hero-sub">
          A minimal three-tier reference app: this page talks to an Express API, which reads
          and writes a PostgreSQL <code>users</code> table.
        </p>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <h2>{isEditing ? `Edit entry No. ${String(form.id).padStart(3, '0')}` : 'Add a person'}</h2>
          <form onSubmit={handleSubmit} className="user-form">
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
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add to directory'}
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
              {filtered.length} {filtered.length === 1 ? 'person' : 'people'}
            </h2>
            <input
              type="search"
              className="search"
              placeholder="Search by name, email, or role"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="empty-state">Loading the directory…</p>
          ) : filtered.length === 0 ? (
            <p className="empty-state">
              {users.length === 0
                ? 'Nobody here yet — add the first person using the form.'
                : 'No matches. Try a different search term.'}
            </p>
          ) : (
            <ul className="user-list">
              {filtered.map((u) => (
                <li className="user-row" key={u.id} style={{ '--accent': accentFor(u.name) }}>
                  <span className="index">No. {String(u.id).padStart(3, '0')}</span>
                  <span className="avatar">{initials(u.name)}</span>
                  <div className="user-info">
                    <span className="user-name">{u.name}</span>
                    <span className="user-email">{u.email}</span>
                  </div>
                  <span className="role-badge">{u.role}</span>
                  <div className="row-actions">
                    <button className="btn-ghost small" onClick={() => startEdit(u)}>
                      Edit
                    </button>
                    <button className="btn-danger small" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="foot">
        React (client) → Express (server) → PostgreSQL (database)
      </footer>
    </div>
  );
}
