import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const menuItems = [
    {
      path: '/admin/users',
      name: 'Users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      path: '/admin/products',
      name: 'Products',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3" />
        </svg>
      )
    },
    {
      path: '/admin/requests',
      name: 'Requests',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/admin/chats',
      name: 'Chats',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white transition-all duration-300 ease-in-out z-50 shadow-2xl ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-xs text-gray-400">Management Dashboard</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <svg className={`w-5 h-5 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 transform ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-r-4 border-blue-400 shadow-lg' 
                      : 'hover:shadow-md'
                  } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                }
              >
                <div className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="font-medium group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                )}
                {!isCollapsed && (
                  <div className="ml-auto">
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className={`group w-full flex items-center px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-400 transition-all duration-200 hover:scale-105 transform ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
        >
          <div className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="font-medium group-hover:text-white transition-colors">
              Logout
            </span>
          )}
        </button>

        {!isCollapsed && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;