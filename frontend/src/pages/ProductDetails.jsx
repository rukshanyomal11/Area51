import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';
import ColorSelector from '../components/women/ColorSelector';
import ErrorBoundary from '../components/ErrorBoundary';
import Footer from '../components/Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (response.ok) {
          setProduct(data);
          if (Array.isArray(data.size) && data.size.length > 0) setSelectedSize(data.size[0]);
          else if (typeof data.size === 'string') setSelectedSize(data.size);
          if (Array.isArray(data.length) && data.length.length > 0) setSelectedLength(data.length[0]);
          else if (typeof data.length === 'string') setSelectedLength(data.length);
          if (Array.isArray(data.color) && data.color.length > 0) setSelectedColor(data.color[0]);
          else if (typeof data.color === 'string') setSelectedColor(data.color);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedLength || !selectedColor) {
      toast.error('Please select Size, Length, and Color before adding to cart.');
      return;
    }

    setAddingToCart(true);

    const newItem = {
      productId: product._id,
      title: product.title,
      price: product.price,
      imageSrc: product.imageSrc,
      size: selectedSize,
      length: selectedLength,
      color: selectedColor,
      quantity,
    };

    const token = localStorage.getItem('token');
    
    try {
      if (token) {
        // User is logged in - try to add to database first
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newItem),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully added to database cart:', data);
          
          // Update localStorage to match database
          updateLocalStorage(newItem);
          
          // Show success message and navigate
          toast.success(`Added to cart: ${newItem.title}`);
          navigate('/cart'); // Navigate to cart page
          
        } else {
          const errorData = await response.json();
          console.error('Database add failed:', errorData);
          throw new Error(errorData.message || 'Failed to add to cart');
        }
      } else {
        // User not logged in - add to localStorage only
        updateLocalStorage(newItem);
        toast.success(`Added to cart: ${newItem.title} (Login to sync with your account)`);
        navigate('/cart'); // Navigate to cart page even for guest users
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage
      updateLocalStorage(newItem);
      toast.success(`Added to local cart: ${newItem.title} (Server error - will sync when available)`);
      navigate('/cart'); // Still navigate to cart page
    } finally {
      setAddingToCart(false);
    }
  };

  const updateLocalStorage = (newItem) => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = existingCart.findIndex(
      (item) =>
        (item.id === newItem.productId || item.productId === newItem.productId) &&
        item.size === newItem.size &&
        item.length === newItem.length &&
        item.color === newItem.color
    );

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += newItem.quantity;
    } else {
      existingCart.push({
        ...newItem,
        id: newItem.productId // Add id field for compatibility
      });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('storage'));
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!product) return <p className="text-center">Product not found.</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300"
          >
            Back
          </button>
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={product.imageSrc}
              alt={product.alt || product.title}
              className="w-full md:w-1/2 h-90 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
              }}
            />
            <div className="md:w-1/2">
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-xl text-gray-700 mb-4">Price: ${product.price.toFixed(2)}</p>
              
              {/* Product Details */}
              <div className="mb-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Brand:</span> {product.brand}</p>
                <p><span className="font-medium">Style:</span> {product.style}</p>
                <p><span className="font-medium">Material:</span> {product.material}</p>
                <p><span className="font-medium">Category:</span> {product.category}</p>
              </div>

              {/* Size */}
              {Array.isArray(product.size) && product.size.length > 0 && (
                <div className="mb-2">
                  <label className="block font-semibold text-gray-700 mb-1">Size:</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {product.size.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Length */}
              {Array.isArray(product.length) && product.length.length > 0 && (
                <div className="mb-2">
                  <label className="block font-semibold text-gray-700 mb-1">Length:</label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {product.length.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color */}
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Color:</label>
                <ErrorBoundary>
                  <ColorSelector
                    colors={product.color || []}
                    selectedColor={selectedColor}
                    onSelectColor={setSelectedColor}
                  />
                </ErrorBoundary>
              </div>

              {/* Quantity */}
              <div className="mb-4 flex items-center gap-2">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <button
                  onClick={decrementQuantity}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                  disabled={addingToCart}
                >
                  -
                </button>
                <span className="px-4 py-1 border border-gray-300 rounded">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                  disabled={addingToCart}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedSize || !selectedLength || !selectedColor}
                  className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
                    addingToCart || !selectedSize || !selectedLength || !selectedColor
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => navigate('/cart')}
                  className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  View Cart
                </button>
              </div>

              {/* Selection Validation Message */}
              {(!selectedSize || !selectedLength || !selectedColor) && (
                <p className="mt-2 text-sm text-red-600">
                  Please select all options (Size, Length, Color) before adding to cart.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;