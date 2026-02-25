import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AIChatBot = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize chat session when component opens
  useEffect(() => {
    if (isOpen && user) {
      initializeSession();
    }
  }, [isOpen, user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai-chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          userName: user.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages(data.messages);
      } else {
        toast.error('Failed to initialize AI chat');
      }
    } catch (error) {
      console.error('Error initializing AI chat:', error);
      toast.error('Failed to connect to AI assistant');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Add user message to display immediately
    const userMsgObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsgObj]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai-chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response to messages
        const aiMsgObj = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          products: data.products || [],
        };
        
        setMessages(prev => [...prev, aiMsgObj]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product details or add to cart
    window.open(`/product/${product.productId}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Shopping Assistant</h3>
              <p className="text-sm text-purple-100">
                Ask me about our products - I'm here to help! ✨
              </p>
            </div>
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
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-lg text-center">
                Welcome! I'm your AI shopping assistant.<br />
                Ask me about products, prices, or recommendations!
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <strong>Try asking:</strong>
                  <ul className="mt-2 text-gray-600 space-y-1">
                    <li>• "Show me men's shirts under $50"</li>
                    <li>• "I need a dress for a party"</li>
                    <li>• "What's new in women's fashion?"</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <strong>I can help with:</strong>
                  <ul className="mt-2 text-gray-600 space-y-1">
                    <li>• Product recommendations</li>
                    <li>• Size and color options</li>
                    <li>• Price comparisons</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        AI
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-3">
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-semibold opacity-75">
                            {msg.role === 'user' ? user.name : 'AI Assistant'}
                          </span>
                          <span className="text-xs opacity-50 ml-2">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>

                      {/* Product recommendations */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">🛍️</span>
                            Product Recommendations
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {msg.products.map((product, productIndex) => (
                              <div
                                key={productIndex}
                                onClick={() => handleProductClick(product)}
                                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md border"
                              >
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={product.imageSrc || '/api/placeholder/60/60'}
                                    alt={product.title}
                                    className="w-12 h-12 object-cover rounded-lg border"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEgyOFYyMEgyMFYyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-gray-900 truncate">
                                      {product.title}
                                    </h5>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-sm font-semibold text-green-600">
                                        ${product.price}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {product.brand}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {product.sizes && product.sizes.slice(0, 3).map((size, i) => (
                                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {size}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      AI
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about products, styles, prices... I'm here to help! 😊"
                rows="2"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send</span>
                <span>{newMessage.length}/500</span>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;