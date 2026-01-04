import React, { useState, useEffect } from 'react';
import './index.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import MenPage from './pages/MenPage';
import ProductDetails from './pages/ProductDetails/';
import CartPage from './pages/CartPage';
import WomenPage from './pages/WomenPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminRequests from './pages/admin/AdminRequests';
import AdminChats from './pages/admin/AdminChats';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AccountPage from './pages/AccountPage';
import ProductChatbot from './components/chatbot/ProductChatbot';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  // Helper function to decode base64url
  const base64UrlDecode = (str) => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = str.length % 4;
    if (pad) {
      if (pad === 1) {
        return null;
      }
      str += new Array(5 - pad).join('=');
    }
    try {
      return atob(str);
    } catch {
      return null;
    }
  };

  const decodeJwtPayload = (token) => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = base64UrlDecode(parts[1]);
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload && payload.email) {
        setUser(payload);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.email !== adminEmail) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen flex flex-col">
          <Toaster
            position="top-center"
            reverseOrder={false}
          />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/men" element={<MenPage />} />
              <Route path="/women" element={<WomenPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
              <Route path="/account" element={<AccountPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/requests"
                element={
                  <ProtectedRoute>
                    <AdminRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/chats"
                element={
                  <ProtectedRoute>
                    <AdminChats />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          {/* AI Chatbot - Available on all pages */}
          <ProductChatbot />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;