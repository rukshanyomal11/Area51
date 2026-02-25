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
    try {
      const token = localStorage.getItem('token');
      
      // Fetch the complete chat data with all messages
      const chatResponse = await fetch(`http://localhost:5000/api/chat/${chat._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (chatResponse.ok) {
        const completeChat = await chatResponse.json();
        setSelectedChat(completeChat);
      } else {
        console.error('Failed to fetch chat details');
        setSelectedChat(chat); // Fallback to original chat data
      }
      
      // Mark as read
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
      console.error('Error selecting chat:', error);
      setSelectedChat(chat); // Fallback to original chat data
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
        onClick={selectedChat ? () => {} : onClose}
      />

      {/* Main Chat Container */}
      <div className="fixed inset-0 z-50 flex">
        {/* Sidebar */}
        <div className="w-96 bg-white shadow-2xl flex flex-col border-r border-gray-200">
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
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedChat?._id === chat._id 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : ''
                  }`}
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

        {/* Main Chat Area */}
        <div className="flex-1 bg-gray-50">
          {selectedChat ? (
            <ChatBox
              key={selectedChat._id}
              chat={selectedChat}
              currentUser={getCurrentUser()}
              onClose={() => {
                setSelectedChat(null);
                fetchChats();
              }}
              isEmbedded={true}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 border-l border-gray-200 bg-white">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-2xl font-semibold mb-2 text-gray-600">Select a chat to start messaging</h2>
              <p className="text-lg">Choose a conversation from the left panel</p>
              <div className="mt-6 text-sm text-gray-500">
                <p>💬 Customer support at your fingertips</p>
                <p className="mt-2">Select any chat to view messages and respond to customers</p>
              </div>
            </div>
          )}
        </div>

        {/* Close Button for the entire interface */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default AdminChatSidebar;
