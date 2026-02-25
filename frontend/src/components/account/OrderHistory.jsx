import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ChatBox from '../chat/ChatBox';

const OrderHistory = ({ orders }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  const handleOpenChat = async (order, item) => {
    console.log('🔵 Opening chat...', { order, item });
    
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        toast.error('Please login to use chat');
        return;
      }
      
      if (!userStr) {
        toast.error('User data not found. Please login again.');
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('🔵 User data:', user);
      
      // Get userId from different possible locations
      const userId = user.id || user._id || user.userId;
      const userName = user.name || user.username || user.email;
      
      if (!userId || !userName) {
        toast.error('User information incomplete. Please login again.');
        return;
      }

      const chatData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: userId,
        userName: userName,
        productId: item.productId || item._id || null,
        productName: item.productName || item.name || item.title,
      };
      
      console.log('🔵 Creating chat with data:', chatData);

      // Create or get existing chat
      const response = await fetch('http://localhost:5000/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chatData),
      });

      console.log('🔵 Response status:', response.status);
      
      if (response.ok) {
        const chat = await response.json();
        console.log('✅ Chat created:', chat);
        setActiveChat(chat);
      } else {
        const error = await response.json();
        console.error('❌ Failed to create chat:', error);
        toast.error('Failed to open chat: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      toast.error('Error opening chat: ' + error.message);
    }
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: user.id,
      name: user.name,
      role: 'user'
    };
  };
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-8xl mb-4">📦</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-500 text-center max-w-md mb-6">
          You haven't placed any orders yet. Start shopping to see your orders here!
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <span className="mr-2">🛍️</span>
          Start Shopping
        </a>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '✅';
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'shipped':
        return '🚚';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="text-3xl mr-3">📋</span>
          Your Orders ({orders.length})
        </h2>
        <p className="text-gray-600">Track and manage all your orders</p>
      </div>

      {orders.map((order) => (
        <div 
          key={order._id} 
          className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Order Header */}
          <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b-2 border-gray-200">
            <div className="flex-1 min-w-[200px] mb-2 sm:mb-0">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🧾</span>
                <p className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📅</span>
                <p>{new Date(order.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)} mb-2`}>
                <span className="mr-2 text-lg">{getStatusIcon(order.status)}</span>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Items (if available) */}
          {order.items && order.items.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">📦</span>
                Items ({order.items.length})
              </h4>
              <div className="space-y-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center text-sm bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mr-4 flex-shrink-0 overflow-hidden border border-gray-200">
                      {item.productImage || item.image || item.imageSrc ? (
                        <img
                          src={item.productImage || item.image || item.imageSrc}
                          alt={item.productName || 'Product'}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center text-3xl"
                        style={{ display: item.productImage || item.image || item.imageSrc ? 'none' : 'flex' }}
                      >
                        👕
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.productName || item.name || 'Product'}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-gray-500 text-xs">
                          <span className="font-medium">Qty:</span> {item.quantity}
                        </p>
                        <span className="text-gray-300">•</span>
                        <p className="text-gray-500 text-xs">
                          <span className="font-medium">Price:</span> ${item.price?.toFixed(2)}
                        </p>
                        {item.size && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-gray-500 text-xs">
                              <span className="font-medium">Size:</span> {item.size}
                            </p>
                          </>
                        )}
                        {item.color && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-gray-500 text-xs">
                              <span className="font-medium">Color:</span> {item.color}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Chat Icon */}
                    <button
                      onClick={() => handleOpenChat(order, item)}
                      className="ml-4 p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
                      title="Chat about this product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    
                    {/* Item Total */}
                    <p className="font-bold text-blue-600 text-lg ml-4">${(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Footer */}
          <div className="flex flex-wrap justify-between items-center pt-4 border-t-2 border-gray-200">
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2 sm:mb-0">
              {order.shippingAddress && (
                <div className="flex items-center">
                  <span className="mr-2">🏠</span>
                  <span className="truncate max-w-xs">
                    {typeof order.shippingAddress === 'string' 
                      ? order.shippingAddress.substring(0, 30) 
                      : `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}`.substring(0, 30)
                    }...
                  </span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="flex items-center">
                  <span className="mr-2">💳</span>
                  <span>{order.paymentMethod}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Track Order Button */}
          <div className="mt-4">
            <button className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transform transition-all duration-200 hover:scale-105 shadow-md">
              <span className="mr-2">🔍</span>
              Track Order
            </button>
          </div>
        </div>
      ))}

      {/* Chat Box Modal */}
      {activeChat && (
        <ChatBox
          chat={activeChat}
          onClose={handleCloseChat}
          currentUser={getCurrentUser()}
        />
      )}
    </div>
  );
};

export default OrderHistory;
