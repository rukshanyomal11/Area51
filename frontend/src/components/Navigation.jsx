import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const Navigation = () => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const linkClass = ({ isActive }) =>
    [
      'relative text-sm font-semibold uppercase tracking-[0.18em] transition',
      isActive ? 'text-red-500' : 'text-gray-700 hover:text-red-500',
    ].join(' ');

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

  const saveCartBeforeLogout = async () => {
    const token = localStorage.getItem('token');
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (token && localCart.length > 0) {
      try {
        await fetch('http://localhost:5000/api/cart/save-before-logout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ items: localCart }),
        });
      } catch (error) {
        console.error('Failed to save cart before logout:', error);
      }
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Save cart before logout
        await saveCartBeforeLogout();
        
        // Call logout endpoint (but don't clear cart from DB)
        await fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('cart'); // Clear local cart on logout
        setCartCount(0);
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Still logout even if there's an error
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        setCartCount(0);
        navigate('/login');
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/85 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold tracking-[0.2em]">
              A1
            </div>
            <h1 className="display-font text-2xl font-semibold tracking-[0.2em] text-gray-900">
              AREA 51
            </h1>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/men" className={linkClass}>
                Men
              </NavLink>
              <NavLink to="/women" className={linkClass}>
                Women
              </NavLink>
              <NavLink
                to="/sale"
                className={({ isActive }) =>
                  [
                    'relative text-sm font-semibold uppercase tracking-[0.18em] transition',
                    isActive ? 'text-red-500' : 'text-red-500/90 hover:text-red-600',
                  ].join(' ')
                }
              >
                Sale
                <span className="ml-2 inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-red-500">
                  New
                </span>
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-800 transition hover:border-red-200 hover:text-red-500"
                >
                  Register
                </NavLink>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Logout
              </button>
            )}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                [
                  'relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-red-200 hover:text-red-500',
                  isActive ? 'text-red-500 border-red-200' : '',
                ].join(' ')
              }
            >
              <FaShoppingCart className="text-base" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
