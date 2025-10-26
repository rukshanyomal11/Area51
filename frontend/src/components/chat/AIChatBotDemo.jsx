import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const AIChatBotDemo = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Demo messages and responses
  const demoResponses = {
    "hello": "Hi there! 👋 I'm your AI shopping assistant. I can help you find the perfect products from our collection. What are you looking for today?",
    "shirt": "Great choice! 👔 I found several shirts for you:\n\n1. Classic Cotton Shirt - $45 (Blue, White, Black)\n2. Premium Dress Shirt - $65 (Multiple colors)\n3. Casual Polo Shirt - $35 (Navy, Red, Green)\n\nWould you like to see more details about any of these?",
    "dress": "Perfect! 👗 Here are some beautiful dresses:\n\n1. Elegant Evening Dress - $120 (Black, Navy)\n2. Casual Summer Dress - $75 (Floral patterns)\n3. Business Dress - $95 (Gray, Black)\n\nWhat occasion are you shopping for?",
    "men": "Looking for men's fashion? 🕺 We have:\n\n• Shirts & Polo\n• Pants & Jeans\n• Jackets & Blazers\n• Casual Wear\n\nWhat type of men's clothing interests you?",
    "women": "Exploring women's fashion? 💃 Our collection includes:\n\n• Dresses & Skirts\n• Tops & Blouses\n• Pants & Jeans\n• Accessories\n\nWhat would you like to browse?",
    "price": "I can help you find products within your budget! 💰\n\nWhat's your price range? For example:\n• Under $50 - Budget-friendly options\n• $50-$100 - Mid-range quality\n• $100+ - Premium collection",
    "default": "That's interesting! 🤔 I'd love to help you find what you're looking for. Could you tell me more about:\n\n• What type of product?\n• Your preferred style?\n• Price range?\n• Any specific brand?\n\nI'm here to make your shopping experience amazing! ✨"
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! 👋 Welcome to the AI Shopping Assistant Demo!\n\nI can help you find products. Try asking:\n• 'Show me shirts'\n• 'I need a dress'\n• 'Men's fashion'\n• 'What's under $50?'\n\nWhat are you looking for today? 🛍️",
        timestamp: new Date(),
        products: []
      }]);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDemoResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return demoResponses.hello;
    }
    if (lowerMessage.includes('shirt') || lowerMessage.includes('polo')) {
      return demoResponses.shirt;
    }
    if (lowerMessage.includes('dress') || lowerMessage.includes('gown')) {
      return demoResponses.dress;
    }
    if (lowerMessage.includes('men') || lowerMessage.includes('male') || lowerMessage.includes('guy')) {
      return demoResponses.men;
    }
    if (lowerMessage.includes('women') || lowerMessage.includes('female') || lowerMessage.includes('girl') || lowerMessage.includes('lady')) {
      return demoResponses.women;
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('$') || lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('expensive')) {
      return demoResponses.price;
    }
    
    return demoResponses.default;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message
    const userMsgObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsgObj]);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = getDemoResponse(userMessage);
      
      const aiMsgObj = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        products: [] // Demo products could be added here
      };
      
      setMessages(prev => [...prev, aiMsgObj]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
                Demo Mode - Try asking about products! ✨
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
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
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
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                      U
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AI
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Try: 'Show me shirts' or 'I need a dress' or 'Men's fashion' 😊"
                rows="2"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send • This is a demo version</span>
                <span>{newMessage.length}/200</span>
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

export default AIChatBotDemo;