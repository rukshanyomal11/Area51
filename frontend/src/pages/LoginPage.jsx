import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
        
        // Restore user's cart after successful login
        await restoreUserCart(data.token);
        
        alert('Login successful! Your cart has been restored.');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Navigation />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Welcome Back</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition-colors duration-300"
            >
              Sign In
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 font-medium hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <p className="text-sm text-center text-gray-600 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;