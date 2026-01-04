import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import AIChatBot from './chat/AIChatBot';

const Navigation = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout: authLogout } = useContext(AuthContext);

  useEffect(() => {
    const updateCartCount = async () => {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalCount = localCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);

      // If user is logged in, sync with database cart
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.items) {
              const dbCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
              setCartCount(dbCount);
              
              // Update local storage with database cart
              const cartItems = data.items.map(item => ({
                id: item.productId,
                title: item.title,
                price: item.price,
                imageSrc: item.imageSrc,
                size: item.size,
                length: item.length,
                color: item.color,
                quantity: item.quantity,
              }));
              localStorage.setItem('cart', JSON.stringify(cartItems));
            }
          }
        } catch (error) {
          console.error('Failed to fetch cart count:', error);
        }
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const intervalId = setInterval(updateCartCount, 5000);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(intervalId);
    };
  }, [token]);

  const handleLogout = async () => {
    if (token) {
      try {
        // Show loading toast
        const logoutToast = toast.loading('Logging out...', {
          duration: 2000,
        });

        // DON'T clear cart from database - keep it for when user logs back in
        // Cart should persist across login sessions
        
        // Use AuthContext logout method
        authLogout();
        setCartCount(0);
        
        // Show success toast
        toast.success('Successfully logged out! 👋', {
          id: logoutToast,
          duration: 3000,
        });
        
        // Delay redirect to show toast
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } catch (error) {
        console.error('Logout failed:', error);
        // Show error toast but still logout
        toast.error('Logout error, but you are logged out! 🔒', {
          duration: 3000,
        });
        
        // Still logout even if there's an error
        authLogout();
        setCartCount(0);
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
  };

  const handleAccountClick = () => {
    navigate('/account'); // Navigate to user account page
  };

  return (
    <nav className="bg-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Area 51</h1>
        <div className="absolute left-1/2 transform -translate-x-1/2 space-x-8 flex items-center">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-red-500 font-semibold' : 'hover:text-red-400')}>
            Home
          </NavLink>
          <NavLink to="/men" className={({ isActive }) => (isActive ? 'text-red-500 font-semibold' : 'hover:text-red-400')}>
            Men
          </NavLink>
          <NavLink to="/women" className={({ isActive }) => (isActive ? 'text-red-500 font-semibold' : 'hover:text-red-400')}>
            Women
          </NavLink>

          {!token ? (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'text-red-500 font-semibold' : 'hover:text-red-400')}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'text-red-500 font-semibold' : 'hover:text-red-400')}>
                Register
              </NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="text-red-500 font-semibold hover:text-red-400">
              Logout
            </button>
          )}

          
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'text-red-500' : 'text-gray-600 hover:text-red-400')}>
            <div className="relative">
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </NavLink>
          {token && (
            <div className="flex items-center space-x-3">
              {user && (
                <span className="text-gray-700 font-medium text-sm">
                  {user.name}
                </span>
              )}
              <NavLink to="/account" className={({ isActive }) => (isActive ? 'text-red-500' : 'text-gray-600 hover:text-red-400')}>
                <div className="relative">
                  <FaUser className="text-xl" />
                </div>
              </NavLink>
            </div>
          )}
        </div>
      </div>
      
      {/* AI ChatBot Modal */}
      <AIChatBot 
        isOpen={isAiChatOpen} 
        onClose={() => setIsAiChatOpen(false)} 
      />

      {/* Floating AI Assistant Button - Always Visible */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            if (!token) {
              toast('Please login to chat with AI Assistant! 🤖', {
                duration: 3000,
                icon: '🔐',
                style: {
                  borderRadius: '10px',
                  background: '#8B5CF6',
                  color: '#fff',
                },
              });
              navigate('/login?message=login-required');
              return;
            }
            setIsAiChatOpen(true);
            toast.success('AI Shopping Assistant is ready to help! 🤖✨', {
              duration: 2000,
              icon: '🚀',
              style: {
                borderRadius: '10px',
                background: '#8B5CF6',
                color: '#fff',
              },
            });
          }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative group animate-pulse"
          title="AI Shopping Assistant"
        >
          <FaRobot className="text-2xl" />
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-purple-800 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
            ✨
          </span>
          

          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              {token ? 'Chat with AI Assistant! 🛍️' : 'Login to use AI Assistant! 🤖'}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>

          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></div>
        </button>


      </div>
    </nav>
  );
};

export default Navigation;