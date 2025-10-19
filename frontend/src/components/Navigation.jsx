import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const [cartCount, setCartCount] = useState(0);
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
        // Clear cart from database on logout
        await fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Use AuthContext logout method
        authLogout();
        setCartCount(0);
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Still logout even if there's an error
        authLogout();
        setCartCount(0);
        navigate('/login');
      }
    }
  };

  const handleAccountClick = () => {
    navigate('/account'); // Navigate to user account page
  };

  return (
    <nav className="bg-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">AREA 51</h1>
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
          <NavLink to="/sale" className={({ isActive }) => (isActive ? 'text-red-500 font-semibold' : 'hover:text-red-400')}>
            Sale
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
    </nav>
  );
};

export default Navigation;