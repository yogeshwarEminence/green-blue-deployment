import React from 'react';
import { PencilIcon, TrashIcon, PeopleIcon } from './icons.jsx';
import { getInitials, getAvatarColor, getDepartmentColors, formatEmployeeId } from '../utils.js';

export default function EmployeeList({ employees, onEdit, onDelete, onAddFirst }) {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <PeopleIcon className="empty-state-icon" />
        <h3>No employees yet</h3>
        <p>Records you add will show up here.</p>
        <button type="button" className="btn btn-primary" onClick={onAddFirst}>
          Add your first employee
        </button>
      </div>
    );
  }

  return (
    <div className="table-card">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Email</th>
            <th>Department</th>
            <th>Record</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const dept = getDepartmentColors(emp.department);
            return (
              <tr key={emp.id}>
                <td data-label="Employee">
                  <div className="employee-cell">
                    <span className="avatar" style={{ backgroundColor: getAvatarColor(emp.name) }}>
                      {getInitials(emp.name)}
                    </span>
                    <span className="employee-name">{emp.name}</span>
                  </div>
                </td>
                <td data-label="Email">
                  <span className="cell-muted">{emp.email}</span>
                </td>
                <td data-label="Department">
                  <span
                    className="chip"
                    style={{ backgroundColor: dept.bg, color: dept.text }}
                  >
                    {emp.department}
                  </span>
                </td>
                <td data-label="Record">
                  <span className="record-id">{formatEmployeeId(emp.id)}</span>
                </td>
                <td data-label="Actions" className="actions-cell">
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => onEdit(emp)}
                      aria-label={`Edit ${emp.name}`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button-danger"
                      onClick={() => onDelete(emp.id)}
                      aria-label={`Delete ${emp.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
