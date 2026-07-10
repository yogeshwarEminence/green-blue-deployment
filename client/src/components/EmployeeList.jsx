import React from 'react';

export default function EmployeeList({ employees, onEdit, onDelete }) {
  if (employees.length === 0) {
    return <p className="empty-state">No employees yet. Add one above.</p>;
  }

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <tr key={emp.id}>
            <td>{emp.id}</td>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>{emp.department}</td>
            <td>
              <button onClick={() => onEdit(emp)}>Edit</button>
              <button className="danger" onClick={() => onDelete(emp.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
