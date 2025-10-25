import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token validity with the backend
      fetch('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.ok) {
            // Token is valid, redirect to returnTo
            navigate(returnTo);
          } else {
            // Token is invalid, clear it and stay on login page
            localStorage.removeItem('token');
          }
        })
        .catch((error) => {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
        });
    }
  }, [navigate, returnTo]);

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
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        
        // Save user data to localStorage for chat functionality
        // Backend returns: { _id, name, email, phone, address, token }
        const userData = {
          id: data._id,
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User data saved to localStorage:', userData);
        
        // Restore user's cart after successful login
        await restoreUserCart(data.token);
        
        toast.success('Login successful! Your cart has been restored.');
        navigate(returnTo);
      } else {
        if (data.message === 'Invalid email or password') {
          const userExists = await fetch('http://localhost:5000/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
          });
          const checkData = await userExists.json();
          if (!checkData.exists) {
            setError('This email is not registered. Please register or use a different email.');
          } else {
            setError('Invalid password. Please try again or use "Forgot Password" if needed.');
          }
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (error) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Navigation />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          {/* Main card */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
            {/* Icon/Logo area */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-center text-gray-600 mb-8">Sign in to continue your journey</p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-95 flex items-center justify-center group"
              >
                <span>Sign In</span>
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Quick Actions</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-indigo-600 font-semibold hover:text-purple-600 transition-colors duration-300 inline-flex items-center group"
              >
                <svg className="w-4 h-4 mr-1 transform group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Forgot Password?
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-indigo-600 font-bold hover:text-purple-600 transition-colors duration-300 hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your data is secure and encrypted
            </p>
          </div>
        </div>
      </main>
      <Footer />

      {/* Custom animations - Add to your global CSS or index.css */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;