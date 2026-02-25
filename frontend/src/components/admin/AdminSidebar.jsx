import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gray-800 text-white p-4 z-50">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <ul className="space-y-2">
        <li>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
            }
          >
            Users
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
            }
          >
            Products
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/requests"
            className={({ isActive }) =>
              `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
            }
          >
            Requests
          </NavLink>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 px-4 rounded hover:bg-gray-700"
          >
            Exit
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;