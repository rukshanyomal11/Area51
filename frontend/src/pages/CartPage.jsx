import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { placeOrder } from '../services/orderService';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchOrLoadCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            // Normalize cart items from database to ensure correct format
            const normalizedItems = (data.items || []).map(item => ({
              productId: item.productId,
              title: item.title,
              price: item.price,
              imageSrc: item.imageSrc,
              size: item.size,
              length: item.length,
              color: item.color,
              quantity: item.quantity,
            }));
            setCartItems(normalizedItems);
            
            // Update localStorage with normalized items
            localStorage.setItem('cart', JSON.stringify(normalizedItems));
          } else {
            throw new Error(data.message || 'Failed to fetch cart');
          }
        } catch (err) {
          console.error('Backend fetch failed:', err);
          const localCart = JSON.parse(localStorage.getItem('cart')) || [];
          setCartItems(localCart);
        }
      } else {
        setCartItems(JSON.parse(localStorage.getItem('cart')) || []);
      }
      setLoading(false);
    };
    fetchOrLoadCart();
  }, [navigate]);

  const syncCartToDatabase = async (updatedCart) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'PUT', // Use PUT to replace the entire cart
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: updatedCart.map(item => ({
              productId: item.productId,
              title: item.title,
              price: item.price,
              imageSrc: item.imageSrc,
              size: item.size,
              length: item.length,
              color: item.color,
              quantity: item.quantity,
            })),
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to sync cart with database');
        }
      } catch (err) {
        console.error('Sync failed:', err);
      }
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    if (selectedItems.has(index)) {
      const newSelected = new Set(selectedItems);
      newSelected.delete(index);
      setSelectedItems(newSelected);
    }
    if (localStorage.getItem('token')) {
      syncCartToDatabase(updatedCart);
    }
  };

  const handleIncrementQuantity = (index) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity += 1;
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    if (localStorage.getItem('token')) {
      syncCartToDatabase(updatedCart);
    }
  };

  const handleDecrementQuantity = (index) => {
    const updatedCart = [...cartItems];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      if (localStorage.getItem('token')) {
        syncCartToDatabase(updatedCart);
      }
    }
  };

  const handleCheckboxChange = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(cartItems.map((_, index) => index)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const selectedCartItems = Array.from(selectedItems).map(index => cartItems[index]);

  const selectedTotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to place an order.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to place your order.');
        navigate('/login?returnTo=/cart');
        return;
      }

      const selectedCartItems = Array.from(selectedItems).map(index => {
        const item = cartItems[index];
        return {
          productId: item.productId || null,
          title: item.title,
          price: Number(item.price),
          imageSrc: item.imageSrc,
          size: item.size,
          length: item.length || 'Standard',
          color: item.color,
          quantity: Number(item.quantity)
        };
      });

      const totalAmount = selectedCartItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);

      const orderData = {
        items: selectedCartItems,
        totalAmount: totalAmount
      };

      console.log('Sending order data:', orderData);

      const result = await placeOrder(orderData, token);
      
      // Clear selected items from cart
      const remainingCart = cartItems.filter((_, index) => !selectedItems.has(index));
      setCartItems(remainingCart);
      localStorage.setItem('cart', JSON.stringify(remainingCart));
      setSelectedItems(new Set());

      toast.success('Order placed successfully! Your order has been submitted and is now being processed.');
      navigate('/account?tab=orders');
      
    } catch (err) {
      console.error('Order placement error:', err);
      if (err.message && err.message.includes('User profile incomplete')) {
        toast.error('Please complete your profile with name, phone, and address before placing an order.');
        navigate('/account?tab=profile');
      } else {
        toast.error(err.message || 'Error placing order. Please try again.');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center bg-gray-100 p-6 rounded-lg shadow">
              <p className="mb-4 text-lg text-gray-700">Your cart is currently empty.</p>
              <button
                onClick={() => navigate('/men')}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length}
                  onChange={handleSelectAll}
                  className="h-5 w-5 text-blue-600 mr-2"
                />
                <label>Select All</label>
              </div>

              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => handleCheckboxChange(index)}
                      className="h-5 w-5 text-blue-600 mr-4"
                    />
                    <img src={item.imageSrc} alt={item.title} className="w-16 h-16 rounded object-cover mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p>Size: {item.size} | Color: {item.color} | ${item.price.toFixed(2)}</p>
                      <div className="flex mt-2">
                        <button
                          onClick={() => handleDecrementQuantity(index)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-l"
                        >
                          -
                        </button>
                        <span className="w-12 text-center border-t border-b">{item.quantity}</span>
                        <button
                          onClick={() => handleIncrementQuantity(index)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-r"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="mt-6 text-right">
                <p className="text-xl font-semibold mb-2">
                  Selected Total: ${selectedTotal.toFixed(2)}
                </p>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || selectedItems.size === 0}
                  className={`py-2 px-6 rounded text-white font-semibold ${
                    isPlacingOrder || selectedItems.size === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isPlacingOrder ? 'Placing Order...' : `Place Order (${selectedItems.size} item(s))`}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;