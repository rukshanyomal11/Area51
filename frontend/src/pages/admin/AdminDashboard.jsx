import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 bg-gray-100">
        {/* The Outlet will render the individual admin components */}
        {/* Each component (AdminUsers, AdminProducts, AdminRequests) handles its own sidebar */}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;