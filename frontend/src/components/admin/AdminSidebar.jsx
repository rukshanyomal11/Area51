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
          <NavLink
            to="/admin/chats"
            className={({ isActive }) =>
              `flex items-center justify-between py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
            }
          >
            <span>Chats</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
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