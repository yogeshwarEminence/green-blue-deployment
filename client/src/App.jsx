import React, { useEffect, useState } from 'react';
import EmployeeList from './components/EmployeeList.jsx';
import EmployeeForm from './components/EmployeeForm.jsx';
import { AlertIcon, PlusIcon } from './components/icons.jsx';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './api.js';
import './App.css';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  function openAddDrawer() {
    setEditingEmployee(null);
    setIsDrawerOpen(true);
  }

  function openEditDrawer(employee) {
    setEditingEmployee(employee);
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setEditingEmployee(null);
  }

  async function handleSave(form) {
    setError('');
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, form);
      } else {
        await createEmployee(form);
      }
      closeDrawer();
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

  const departmentCount = new Set(employees.map((e) => e.department)).size;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-text">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <h1>Employee Directory</h1>
          </div>
          <p className="header-subtitle">
            {loading
              ? 'Loading records…'
              : `${employees.length} ${employees.length === 1 ? 'person' : 'people'}${
                  departmentCount ? ` across ${departmentCount} department${departmentCount === 1 ? '' : 's'}` : ''
                }`}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddDrawer}>
          <PlusIcon />
          Add employee
        </button>
      </header>

      {error && (
        <div className="alert" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <main>
        {loading ? (
          <div className="skeleton-card" aria-label="Loading employees">
            {[0, 1, 2, 3].map((i) => (
              <div className="skeleton-row" key={i}>
                <span className="skeleton-avatar" />
                <span className="skeleton-line" style={{ width: '30%' }} />
                <span className="skeleton-line" style={{ width: '25%' }} />
                <span className="skeleton-line" style={{ width: '15%' }} />
              </div>
            ))}
          </div>
        ) : (
          <EmployeeList
            employees={employees}
            onEdit={openEditDrawer}
            onDelete={handleDelete}
            onAddFirst={openAddDrawer}
          />
        )}
      </main>

      <EmployeeForm
        editingEmployee={editingEmployee}
        isOpen={isDrawerOpen}
        onSave={handleSave}
        onCancel={closeDrawer}
      />
    </div>
  );
}
