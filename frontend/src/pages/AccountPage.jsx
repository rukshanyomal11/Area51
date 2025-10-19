import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import UserProfileForm from '../components/account/UserProfileForm';
import OrderHistory from '../components/account/OrderHistory';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { getUserOrders } from '../services/orderService';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useSocket } from '../context/SocketContext';

const AccountPage = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const { connectUser } = useSocket();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Connect user to Socket.IO
    if (user && user._id) {
      connectUser(user._id, 'user');
    }
  }, [user]);

  useEffect(() => {
    // Check URL parameters for tab
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'orders') {
      setActiveTab('orders');
    }
  }, [location.search]);

  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  }, [user, token]);

  useEffect(() => {
    // Only fetch orders when user is properly loaded
    if (user && user._id && token) {
      fetchOrders();
    }
  }, [user?._id, token]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user?._id]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data with token:', token);
      const data = await getUserProfile(token);
      console.log('Received user data:', data);
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!user?._id || !token) return;

      setLoading(true);
      setError(null);
      
      const ordersData = await getUserOrders(user._id, token);
      setOrders(ordersData);
    } catch (error) {
      setError(error.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const updated = await updateUserProfile(updatedData, token);
      setUserData(updated.user);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders') {
      setLoading(true);
      fetchOrders().finally(() => setLoading(false));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your account</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section with Gradient */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'User'}! 👋</h1>
              <p className="text-blue-100 text-lg">Manage your profile and view your order history</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex space-x-1 px-6">
              <button
                onClick={() => handleTabChange('profile')}
                className={`group relative py-4 px-6 font-semibold text-base transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-xl">👤</span>
                  <span>Profile</span>
                </span>
                {activeTab === 'profile' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full"></div>
                )}
              </button>
              
              <button
                onClick={() => handleTabChange('orders')}
                className={`group relative py-4 px-6 font-semibold text-base transition-all duration-200 ${
                  activeTab === 'orders'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-xl">📦</span>
                  <span>Order History</span>
                  {orders.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </span>
                {activeTab === 'orders' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full"></div>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'profile' && userData && (
              <UserProfileForm 
                userData={userData} 
                onUpdate={handleProfileUpdate} 
              />
            )}
            
            {activeTab === 'orders' && (
              loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading your orders...</p>
                </div>
              ) : (
                <OrderHistory orders={orders} />
              )
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact us at <span className="text-blue-600 font-semibold">support@clothingstore.com</span>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountPage;
