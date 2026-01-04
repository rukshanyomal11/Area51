import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    // If user is already logged in (via AuthContext), redirect them
    if (token) {
      toast.success('You are already logged in! Redirecting...', {
        duration: 2000,
        icon: '✅',
      });
      setTimeout(() => {
        navigate(returnTo);
      }, 1000);
    } else {
      // Show welcome toast for new visitors
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('message') === 'login-required') {
        toast('Please log in to continue 🔐', {
          duration: 3000,
          icon: '👋',
          style: {
            borderRadius: '10px',
            background: '#3B82F6',
            color: '#fff',
          },
        });
      }
    }
  }, [token, navigate, returnTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const restoreUserCart = async (token) => {
    try {
      // Get local cart
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Get user's saved cart from database
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const dbCart = await response.json();
        
        if (localCart.length > 0) {
          // If user has local cart items, merge them with database cart
          await fetch('http://localhost:5000/api/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: localCart }),
          });
        }
        
        // Fetch the updated cart after merge
        const updatedResponse = await fetch('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (updatedResponse.ok) {
          const updatedCart = await updatedResponse.json();
          
          // Update local storage with merged cart
          if (updatedCart.items) {
            const cartItems = updatedCart.items.map((item) => ({
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
      }
    } catch (error) {
      console.error('Error restoring cart:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        // Prepare user data for AuthContext
        const userData = {
          id: data._id,
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        };
        
        // Use AuthContext login method to update state and localStorage
        login(userData, data.token);
        
        // Show loading toast
        const loginToast = toast.loading('Logging you in...', {
          duration: 2000,
        });

        // Restore user's cart after successful login
        await restoreUserCart(data.token);
        
        // Show success toast with user's name
        toast.success(`Welcome back, ${userData.name}! 🎉\nYour cart has been restored.`, {
          id: loginToast,
          duration: 4000,
          icon: '👋',
          style: {
            borderRadius: '10px',
            background: '#10B981',
            color: '#fff',
          },
        });
        
        // Delay redirect to show toast
        setTimeout(() => {
          window.location.href = returnTo === '/' ? '/' : returnTo;
        }, 1500);
      } else {
        if (data.message === 'Invalid email or password') {
          const userExists = await fetch('http://localhost:5000/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
          });
          const checkData = await userExists.json();
          if (!checkData.exists) {
            const errorMsg = 'This email is not registered. Please register or use a different email.';
            setError(errorMsg);
            toast.error(errorMsg, {
              duration: 5000,
              icon: '❌',
              style: {
                borderRadius: '10px',
                background: '#EF4444',
                color: '#fff',
              },
            });
          } else {
            const errorMsg = 'Invalid password. Please try again or use "Forgot Password" if needed.';
            setError(errorMsg);
            toast.error(errorMsg, {
              duration: 5000,
              icon: '🔒',
              style: {
                borderRadius: '10px',
                background: '#EF4444',
                color: '#fff',
              },
            });
          }
        } else {
          const errorMsg = data.message || 'Login failed';
          setError(errorMsg);
          toast.error(errorMsg, {
            duration: 4000,
            icon: '⚠️',
            style: {
              borderRadius: '10px',
              background: '#EF4444',
              color: '#fff',
            },
          });
        }
      }
    } catch (error) {      setIsLoading(false);      const errorMsg = 'Server error. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        icon: '🔌',
        style: {
          borderRadius: '10px',
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <Navigation />
      
      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Left side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome!</h2>
              <p className="text-gray-500">Sign in to your Account</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Email Address"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Link
                  to="/register"
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 text-center"
                >
                  SIGN UP
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 px-6 py-3 ${
                    isLoading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group`}
                >
                  <span className={`inline-block transition-all duration-500 ${isLoading ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    SIGN IN
                  </span>
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                  <span className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 transform ${isLoading ? 'scale-100' : 'scale-0'} transition-transform duration-700 ease-in-out rounded-lg`}></span>
                </button>
              </div>
            </form>

            {/* Social Login Section */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-6">
                {/* Facebook */}
                <button className="p-3 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                {/* LinkedIn */}
                <button className="p-3 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                  <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                  Sign Up here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Shopping Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mt-48"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32"></div>
          
          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
            <div className="text-center mb-8">
              <p className="text-xl text-blue-100">Welcome Back to Style</p>
            </div>
            
            {/* Shopping illustration */}
            <div className="w-full max-w-lg">
              <div className="bg-white/95 rounded-3xl p-8 shadow-2xl">
                {/* Shopping image from public folder */}
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img 
                    src="/shopping.png" 
                    alt="People Shopping" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;