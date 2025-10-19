import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';

const ChatBox = ({ chat, onClose, currentUser }) => {
  const [messages, setMessages] = useState(chat?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, joinChat, sendMessage, sendTypingIndicator } = useSocket();
  const typingTimeoutRef = useRef(null);

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
