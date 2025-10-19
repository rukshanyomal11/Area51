import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import ChatBox from '../chat/ChatBox';

const AdminChatSidebar = ({ isOpen, onClose }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    fetchChats();

    // Listen for new messages
    if (socket) {
      socket.on('admin_notification', (data) => {
        if (data.type === 'new_message') {
          fetchChats();
          // Update unread count
          setUnreadCount((prev) => prev + 1);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('admin_notification');
      }
    };
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
        
        // Calculate total unread messages
        const totalUnread = data.reduce((acc, chat) => acc + (chat.unreadCount?.admin || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'admin' }),
      });
      
      // Update local state
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === chat._id ? { ...c, unreadCount: { ...c.unreadCount, admin: 0 } } : c
        )
      );
      
      fetchChats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: user._id || user.id,
      _id: user._id || user.id,
      name: user.name || 'Admin',
      email: user.email,
      role: 'admin'
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <span className="mr-2">💬</span>
              Customer Chats
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white mt-1">
                {unreadCount} unread
              </span>
            )}
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

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-lg text-center">No active chats</p>
              <p className="text-sm text-center mt-2">Customer chats will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {chat.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{chat.userName}</h4>
                        <p className="text-xs text-gray-500">Order #{chat.orderNumber}</p>
                      </div>
                    </div>
                    {chat.unreadCount?.admin > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-500 text-white">
                        {chat.unreadCount.admin}
                      </span>
                    )}
                  </div>
                  
                  {chat.productName && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Product:</span> {chat.productName}
                    </p>
                  )}
                  
                  {chat.messages && chat.messages.length > 0 && (
                    <p className="text-sm text-gray-500 truncate">
                      {chat.messages[chat.messages.length - 1].message}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.lastMessage).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={fetchChats}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold"
          >
            🔄 Refresh Chats
          </button>
        </div>
      </div>

      {/* Chat Box Modal */}
      {selectedChat && (
        <ChatBox
          chat={selectedChat}
          onClose={() => {
            setSelectedChat(null);
            fetchChats();
          }}
          currentUser={getCurrentUser()}
        />
      )}
    </>
  );
};

export default AdminChatSidebar;
