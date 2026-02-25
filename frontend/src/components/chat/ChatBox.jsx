import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const ChatBox = ({ chat, onClose, currentUser, isEmbedded = false }) => {
  const [messages, setMessages] = useState(chat?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, joinChat, sendMessage, sendTypingIndicator } = useSocket();
  const typingTimeoutRef = useRef(null);

  // Update messages when chat changes
  useEffect(() => {
    if (chat && chat.messages) {
      setMessages(chat.messages);
    }
  }, [chat]);

  useEffect(() => {
    if (chat && chat._id) {
      joinChat(chat._id);
      markAsRead();
    }

    // Listen for new messages
    if (socket) {
      socket.on('receive_message', (data) => {
        if (data.chatId === chat._id) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      });

      socket.on('user_typing', (data) => {
        if (data.chatId === chat._id && data.userName !== currentUser.name) {
          setTypingUser(data.isTyping ? data.userName : null);
          setTimeout(() => setTypingUser(null), 3000);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
      }
    };
  }, [chat, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = currentUser.role || 'user';
      
      await fetch(`http://localhost:5000/api/chat/${chat._id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    console.log('💬 Sending message - Current User:', currentUser);

    const messageData = {
      sender: currentUser._id || currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role || 'user',
      message: newMessage,
      timestamp: new Date(),
    };

    console.log('💬 Message Data:', messageData);

    try {
      const token = localStorage.getItem('token');
      
      console.log('💬 Sending to API:', `http://localhost:5000/api/chat/${chat._id}/message`);
      
      // Send to server via REST API
      const response = await fetch(`http://localhost:5000/api/chat/${chat._id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      console.log('💬 API Response status:', response.status);

      if (response.ok) {
        console.log('✅ Message sent successfully via API');
        // Send via Socket.IO for real-time update to other users
        sendMessage(chat._id, messageData);
        // Don't add to local state here - let Socket.IO receive_message handle it
        // This prevents duplicate messages
        setNewMessage('');
        setIsTyping(false);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send message:', errorData);
        alert(`Failed to send message: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(chat._id, currentUser.name, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(chat._id, currentUser.name, false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If embedded mode (for sidebar), return just the chat content without modal wrapper
  if (isEmbedded) {
    return (
      <div className="w-full h-full flex flex-col bg-white border-l border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <span className="mr-2">💬</span>
              Chat Support
            </h3>
            <p className="text-sm text-blue-100">
              Order #{chat?.orderNumber} {chat?.productName && `- ${chat.productName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer & Order Information */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h5>
              
              <div className="space-y-2 text-sm">
                {/* Customer Name - Always show */}
                <div className="flex items-center">
                  <span className="text-gray-500 w-16">Name:</span>
                  <span className="font-medium text-gray-900">
                    {chat?.userName || chat?.userId?.name || chat?.customerName || 'N/A'}
                  </span>
                </div>
                
                {/* Customer Email */}
                {(chat?.userEmail || chat?.userId?.email || chat?.customerEmail) && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-16">Email:</span>
                    <span className="text-gray-700">
                      {chat?.userEmail || chat?.userId?.email || chat?.customerEmail}
                    </span>
                  </div>
                )}
                
                {/* Customer Phone */}
                {(chat?.userPhone || chat?.userId?.phone || chat?.customerPhone) && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-16">Phone:</span>
                    <span className="text-gray-700">
                      {chat?.userPhone || chat?.userId?.phone || chat?.customerPhone}
                    </span>
                  </div>
                )}

                {/* Customer Address */}
                {(chat?.userAddress || chat?.userId?.address || chat?.customerAddress) && (
                  <div className="flex items-start">
                    <span className="text-gray-500 w-16">Address:</span>
                    <span className="text-gray-700 flex-1">
                      {chat?.userAddress || chat?.userId?.address || chat?.customerAddress}
                    </span>
                  </div>
                )}

                {/* Customer ID */}
                {(chat?.userId?._id || chat?.customerId) && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-16">ID:</span>
                    <span className="font-mono text-gray-600 text-xs">
                      {chat?.userId?._id || chat?.customerId}
                    </span>
                  </div>
                )}

                {/* Member Since */}
                {(chat?.userId?.createdAt || chat?.memberSince) && (
                  <div className="flex items-center">
                    <span className="text-gray-500 w-16">Member:</span>
                    <span className="text-gray-700">
                      {new Date(chat?.userId?.createdAt || chat?.memberSince).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Details
              </h5>
              
              {/* Product Purchased - Always show */}
              <div className="space-y-3 text-sm">
                <h6 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                  <span className="mr-2">📦</span>
                  Product Purchased:
                </h6>
                
                {(chat?.productName || chat?.productId?.title) ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={chat?.productImage || chat?.productId?.imageSrc || '/api/placeholder/60/60'}
                          alt={chat?.productName || chat?.productId?.title || 'Product'}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-white"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkgzNlYyNEgyNFYzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {chat?.productName || chat?.productId?.title || 'Product Name Not Available'}
                        </p>
                        
                        {/* Price/Payment Information */}
                        {(chat?.orderId?.items?.[0]?.price || chat?.orderId?.totalAmount) && (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-sm inline-flex items-center">
                              💰 Paid: ${chat?.orderId?.items?.[0]?.price || (chat?.orderId?.totalAmount / (chat?.orderId?.items?.length || 1)).toFixed(2)}
                            </span>
                            {chat?.orderId?.totalAmount && chat?.orderId?.items?.length > 1 && (
                              <span className="px-2 py-1 bg-blue-500 text-white rounded-full font-medium text-xs">
                                Total Order: ${chat.orderId.totalAmount}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Purchase Specifications - Show actual order data */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {/* Get first item from order (assuming single product per chat) */}
                          {chat?.orderId?.items?.[0] && (
                            <>
                              {/* Size - from order item */}
                              {chat.orderId.items[0].size && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium inline-flex items-center">
                                  Size: {chat.orderId.items[0].size}
                                </span>
                              )}
                              
                              {/* Color - from order item */}
                              {chat.orderId.items[0].color && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium inline-flex items-center">
                                  Color: {chat.orderId.items[0].color}
                                </span>
                              )}
                              
                              {/* Length - from order item */}
                              {chat.orderId.items[0].length && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium inline-flex items-center">
                                  Length: {chat.orderId.items[0].length}
                                </span>
                              )}
                              
                              {/* Quantity - from order item */}
                              {chat.orderId.items[0].quantity && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium inline-flex items-center">
                                  Qty: {chat.orderId.items[0].quantity}
                                </span>
                              )}
                            </>
                          )}
                          
                          {/* Brand and Style from populated product data */}
                          {chat?.productId?.brand && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full font-medium inline-flex items-center">
                              Brand: {chat.productId.brand}
                            </span>
                          )}
                          
                          {chat?.productId?.style && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium inline-flex items-center">
                              Style: {chat.productId.style}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                    <p className="text-sm">No product information available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-lg">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender === currentUser.id || msg.senderRole === currentUser.role;
                
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-semibold opacity-75">
                          {msg.senderName}
                        </span>
                        <span className="text-xs opacity-50 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Typing Indicator */}
          {typingUser && (
            <div className="flex items-center text-gray-500 text-sm mt-2">
              <span className="animate-pulse">{typingUser} is typing...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end space-x-2">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="2"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold"
            >
              Send 📤
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default modal mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <span className="mr-2">💬</span>
              Chat Support
            </h3>
            <p className="text-sm text-blue-100">
              Order #{chat?.orderNumber} {chat?.productName && `- ${chat.productName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product & Order Details Section - Modal Version */}
        {(chat?.productId || chat?.productName) && (
          <div className="bg-gray-50 border-b border-gray-200 p-3">
            <div className="flex items-start space-x-3">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={chat.productImage || chat.productId?.imageSrc || '/api/placeholder/60/60'}
                  alt={chat.productName || chat.productId?.title || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAzOEgzOFYyNkgyNlYzOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
              </div>
              
              {/* Product & Purchase Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 mb-2 truncate">
                  {chat.productName || chat.productId?.title || 'Product'}
                </h4>
                
                {/* General Info - Compact */}
                <div className="space-y-2">
                  {/* Price and Basic Info */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(chat.productPrice || chat.productId?.price) && (
                      <span className="font-bold text-green-600">
                        ${chat.productPrice || chat.productId?.price}
                      </span>
                    )}
                    
                    {chat.productId?.brand && (
                      <span className="text-gray-500">{chat.productId.brand}</span>
                    )}
                    
                    {chat.productId?.material && (
                      <span className="text-gray-500">{chat.productId.material}</span>
                    )}

                    {chat.productId?.category && (
                      <span className="text-gray-500">{chat.productId.category}</span>
                    )}

                    {chat.productId?.style && (
                      <span className="text-gray-500">{chat.productId.style}</span>
                    )}

                    {chat.productId?.fit && (
                      <span className="text-gray-500">{chat.productId.fit}</span>
                    )}
                    
                    {chat.orderStatus && (
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        chat.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        chat.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        chat.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {chat.orderStatus}
                      </span>
                    )}
                  </div>


                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-lg">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender === currentUser.id || msg.senderRole === currentUser.role;
                
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-semibold opacity-75">
                          {msg.senderName}
                        </span>
                        <span className="text-xs opacity-50 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Typing Indicator */}
          {typingUser && (
            <div className="flex items-center text-gray-500 text-sm mt-2">
              <span className="animate-pulse">{typingUser} is typing...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end space-x-2">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="2"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold"
            >
              Send 📤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
