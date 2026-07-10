import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons.jsx';

const emptyForm = { name: '', email: '', department: '' };

// Same behavior as before (add / edit / cancel), presented as a slide-over
// drawer instead of an inline block - the modern pattern for focused,
// single-record forms.
export default function EmployeeForm({ editingEmployee, isOpen, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    setForm(editingEmployee || emptyForm);
  }, [editingEmployee, isOpen]);

  useEffect(() => {
    if (isOpen) {
      firstFieldRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onCancel}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="drawer-header">
            <h2 id="drawer-title">{editingEmployee ? 'Edit employee' : 'Add employee'}</h2>
            <button
              type="button"
              className="icon-button"
              onClick={onCancel}
              aria-label="Close panel"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="drawer-body">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                ref={firstFieldRef}
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane.doe@example.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Engineering"
                required
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEmployee ? 'Save changes' : 'Add employee'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
