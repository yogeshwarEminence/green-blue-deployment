import React, { useEffect, useState } from 'react';

const emptyForm = { name: '', email: '', department: '' };

export default function EmployeeForm({ editingEmployee, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(editingEmployee || emptyForm);
  }, [editingEmployee]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    setForm(emptyForm);
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>

      <div className="form-row">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />
      </div>

      <div className="form-row">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane.doe@example.com"
          required
        />
      </div>

      <div className="form-row">
        <label>Department</label>
        <input
          type="text"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Engineering"
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit">{editingEmployee ? 'Update' : 'Add'}</button>
        {editingEmployee && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
