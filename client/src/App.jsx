import React, { useEffect, useState } from 'react';
import EmployeeList from './components/EmployeeList.jsx';
import EmployeeForm from './components/EmployeeForm.jsx';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './api.js';
import './App.css';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);

  async function loadEmployees() {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleSave(form) {
    setError('');
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, form);
        setEditingEmployee(null);
      } else {
        await createEmployee(form);
      }
      await loadEmployees();
    } catch (err) {
      setError(err.message || 'Failed to save employee');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Employee Management</h1>
        <p className="subtitle">A simple demo app for learning Docker &amp; AWS deployment</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <EmployeeForm
        editingEmployee={editingEmployee}
        onSave={handleSave}
        onCancel={() => setEditingEmployee(null)}
      />

      {loading ? (
        <p className="loading-state">Loading employees...</p>
      ) : (
        <EmployeeList
          employees={employees}
          onEdit={setEditingEmployee}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
