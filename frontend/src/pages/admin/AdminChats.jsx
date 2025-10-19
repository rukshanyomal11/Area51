import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ChatBox from '../../components/chat/ChatBox';
import { useSocket } from '../../context/SocketContext';

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    // Get admin user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setAdminUser({
        id: parsedUser._id || parsedUser.id,
        _id: parsedUser._id || parsedUser.id,
        name: parsedUser.name || 'Admin',
        email: parsedUser.email,
        role: 'admin'
      });
    }
    
    fetchChats();
    
    // Listen for new messages
    if (socket) {
      socket.on('admin_notification', (data) => {
        console.log('📩 New message notification:', data);
        fetchChats(); // Refresh chat list
      });

      return () => {
        socket.off('admin_notification');
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/admin/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else {
        console.error('Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    
    // Mark as read
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/chat/${chat._id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });
      
      // Refresh chat list
      fetchChats();
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/chat/${chatId}/close`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSelectedChat(null);
      fetchChats();
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    const userName = chat.userId?.name?.toLowerCase() || '';
    const orderId = chat.orderId?._id?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return userName.includes(search) || orderId.includes(search);
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Chat List Panel */}
      <div className="ml-64 flex-1 flex">
        {/* Left Panel - Chat List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
            <h1 className="text-2xl font-bold text-white mb-4">Customer Chats</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer or order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">No chats yet</p>
                <p className="text-sm mt-2">Customer chats will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredChats.map((chat) => {
                  const lastMessage = chat.messages?.[chat.messages.length - 1];
                  const isUnread = chat.unreadCount?.admin > 0;
                  
                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        selectedChat?._id === chat._id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                      } ${isUnread ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                            {chat.userId?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {chat.userId?.name || 'Unknown User'}
                              </h3>
                              {isUnread && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-500 text-white">
                                  {chat.unreadCount.admin}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              Order #{chat.orderId?._id?.slice(-8) || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400">
                            {lastMessage ? formatTime(lastMessage.timestamp) : ''}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            chat.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {chat.status}
                          </span>
                        </div>
                      </div>
                      
                      {lastMessage && (
                        <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {lastMessage.senderRole === 'admin' && '👤 You: '}
                          {lastMessage.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Window */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          {selectedChat && adminUser ? (
            <div className="w-full h-full">
              <ChatBox
                chat={selectedChat}
                currentUser={adminUser}
                onClose={() => setSelectedChat(null)}
                onCloseChat={handleCloseChat}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-xl font-medium mb-2">Select a chat to start messaging</p>
              <p className="text-sm">Choose a conversation from the left panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
