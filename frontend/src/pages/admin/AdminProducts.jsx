// Enhanced AdminProducts.js with comprehensive debugging
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

// Helper function to validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    imageSrc: '',
    size: [],
    color: [],
    brand: '',
    material: '',
    length: [],
    style: '',
    category: 'Men',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { connectUser } = useSocket();

  // Connect admin to Socket.IO
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      connectUser(user.id, 'admin');
    }
  }, []);

  // Enhanced function to fetch products with retry mechanism
  const fetchProducts = async (retryCount = 0) => {
    console.log('🔄 ADMIN: Starting to fetch products...');
    setLoading(true);
    
    if (!token) {
      console.error('❌ ADMIN: No token found');
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      const url = 'http://localhost:5000/api/products/admin';
      console.log('🌐 ADMIN: Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('📡 ADMIN: Response status:', response.status);
      
      if (response.status === 401) {
        console.error('❌ ADMIN: Token expired or invalid');
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      console.log('📦 ADMIN: Received data:', data);
      console.log('📦 ADMIN: Number of products:', data?.length || 0);
      
      if (response.ok) {
        setProducts(data || []);
        console.log('✅ ADMIN: Products set successfully');
        
        // Debug: Show category breakdown
        const menProducts = (data || []).filter(p => p.category === 'Men');
        const womenProducts = (data || []).filter(p => p.category === 'Women');
        console.log('👔 ADMIN: Men\'s products:', menProducts.length);
        console.log('👗 ADMIN: Women\'s products:', womenProducts.length);
      } else {
        console.error('❌ ADMIN: API Error:', data.message);
        setError(data.message || 'Failed to fetch products');
        
        // Retry mechanism for server errors
        if (response.status >= 500 && retryCount < 3) {
          console.log(`🔄 ADMIN: Retrying fetch... (${retryCount + 1}/3)`);
          setTimeout(() => fetchProducts(retryCount + 1), 2000 * (retryCount + 1));
        }
      }
    } catch (err) {
      console.error('💥 ADMIN: Fetch Error:', err);
      setError('Server error. Please try again.');
      
      // Retry mechanism for network errors
      if (retryCount < 3) {
        console.log(`🔄 ADMIN: Retrying fetch... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProducts(retryCount + 1), 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
      console.log('🏁 ADMIN: Fetch completed');
    }
  };

  useEffect(() => {
    console.log('🚀 ADMIN: Component mounted');
    fetchProducts();
  }, [token]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('📝 ADMIN: Input change:', { name, value, type, checked });
    
    if (type === 'checkbox') {
      const currentProduct = editingProduct || newProduct;
      const updatedArray = checked
        ? [...(currentProduct[name] || []), value]
        : (currentProduct[name] || []).filter(item => item !== value);
      
      console.log('📝 ADMIN: Updated array for', name, ':', updatedArray);
      
      if (editingProduct) {
        setEditingProduct(prev => ({
          ...prev,
          [name]: updatedArray,
        }));
      } else {
        setNewProduct(prev => ({
          ...prev,
          [name]: updatedArray,
        }));
      }
    } else {
      if (editingProduct) {
        setEditingProduct(prev => ({
          ...prev,
          [name]: value,
        }));
      } else {
        setNewProduct(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    console.log('🎯 ADMIN: Starting to add product...');
    console.log('🎯 ADMIN: New product data:', JSON.stringify(newProduct, null, 2));
    
    if (!token) {
      console.error('❌ ADMIN: No token found');
      setError('Please log in to add a product.');
      return;
    }
    
    if (newProduct.imageSrc && !isValidImageUrl(newProduct.imageSrc)) {
      console.error('❌ ADMIN: Invalid image URL:', newProduct.imageSrc);
      setError('Please enter a valid image URL (must start with http:// or https:// and end with an image extension)');
      return;
    }
    
    // Validate required fields
    if (!newProduct.title || !newProduct.price || !newProduct.imageSrc || 
        !newProduct.brand || !newProduct.material || !newProduct.style || 
        !newProduct.category || newProduct.size.length === 0 || 
        newProduct.color.length === 0 || newProduct.length.length === 0) {
      setError('Please fill in all required fields and select at least one size, color, and length');
      return;
    }

    // Validate price
    const numericPrice = parseFloat(newProduct.price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Please enter a valid positive price');
      return;
    }
    
    setLoading(true);
    try {
      const url = 'http://localhost:5000/api/products';
      console.log('🌐 ADMIN: Posting to URL:', url);
      console.log('📦 ADMIN: Request body:', JSON.stringify(newProduct, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });
      
      console.log('📡 ADMIN: Response status:', response.status);
      console.log('📡 ADMIN: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📦 ADMIN: Response data:', data);
      
      if (response.ok) {
        console.log('✅ ADMIN: Product added successfully:', data);
        setProducts(prevProducts => [...prevProducts, data]);
        setNewProduct({
          title: '',
          price: '',
          imageSrc: '',
          size: [],
          color: [],
          brand: '',
          material: '',
          length: [],
          style: '',
          category: 'Men',
        });
        setSuccessMessage(`Product "${data.title}" added successfully! It will appear on the ${data.category}'s page. Navigate to the ${data.category}'s page to see it.`);
        setError('');
        
        // Set a flag in localStorage FIRST to ensure category pages refresh even if they're loaded after the event
        const updateData = {
          timestamp: Date.now(),
          category: data.category,
          action: 'added',
          productId: data._id
        };
        console.log('💾 ADMIN: Setting localStorage flag:', updateData);
        localStorage.setItem('productUpdated', JSON.stringify(updateData));
        console.log('✅ ADMIN: localStorage flag set successfully');
        
        // Then dispatch the event for any already-loaded pages
        console.log('📢 ADMIN: Broadcasting productAdded event');
        window.dispatchEvent(new CustomEvent('productAdded', { 
          detail: {
            category: data.category,
            product: data
          }
        }));

        // Small delay to ensure event is processed, then refresh admin list
        setTimeout(() => {
          console.log('🔄 ADMIN: Refreshing product list after successful add');
          fetchProducts();
        }, 100);
      } else {
        console.error('❌ ADMIN: Server error:', data.message);
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      console.error('💥 ADMIN: Fetch error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 ADMIN: Add product completed');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    console.log('📝 ADMIN: Starting to update product...');
    console.log('📝 ADMIN: Editing product data:', JSON.stringify(editingProduct, null, 2));
    
    if (!token) {
      setError('Please log in to update a product.');
      return;
    }
    
    if (editingProduct.imageSrc && !isValidImageUrl(editingProduct.imageSrc)) {
      setError('Please enter a valid image URL (must start with http:// or https:// and end with an image extension)');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ ADMIN: Product updated successfully:', data);
        setProducts(products.map(product => product._id === editingProduct._id ? data : product));
        setEditingProduct(null);
        setSuccessMessage(`Product "${data.title}" updated successfully!`);
        setError('');
        
        // Set localStorage flag FIRST for navigation-based updates
        const updateData = {
          timestamp: Date.now(),
          category: data.category,
          action: 'updated',
          productId: data._id
        };
        localStorage.setItem('productUpdated', JSON.stringify(updateData));
        
        // Then broadcast product updated event
        console.log('📢 ADMIN: Broadcasting productUpdated event');
        window.dispatchEvent(new CustomEvent('productUpdated', { 
          detail: { product: data, category: data.category } 
        }));
      } else {
        console.error('❌ ADMIN: Update error:', data.message);
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('💥 ADMIN: Update error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!token) {
      setError('Please log in to delete a product.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (response.ok) {
          const deletedProduct = products.find(p => p._id === productId);
          console.log('🗑️ ADMIN: Product deleted:', deletedProduct);
          setProducts(products.filter(product => product._id !== productId));
          setSuccessMessage('Product deleted successfully!');
          setError('');
          
          // Set localStorage flag FIRST for navigation-based updates
          if (deletedProduct) {
            const updateData = {
              timestamp: Date.now(),
              category: deletedProduct.category,
              action: 'deleted',
              productId: productId
            };
            localStorage.setItem('productUpdated', JSON.stringify(updateData));
            
            // Then broadcast product deleted event
            console.log('📢 ADMIN: Broadcasting productDeleted event');
            window.dispatchEvent(new CustomEvent('productDeleted', { 
              detail: { productId, category: deletedProduct.category } 
            }));
          }
        } else {
          setError(data.message || 'Failed to delete product');
        }
      } catch (err) {
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateToCategory = (category) => {
    console.log('🧭 ADMIN: Navigating to category:', category);
    if (category === 'Men') {
      navigate('/men');
    } else if (category === 'Women') {
      navigate('/women');
    }
  };

  if (loading && products.length === 0) return <p className="text-center">Loading...</p>;

  return (
    <div className="flex min-h-screen">
      {token && <AdminSidebar />}
      <div className={`flex-1 bg-gray-100 ${token ? 'ml-64' : ''}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Products Management</h1>
          
          {/* Debug Info Panel */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold text-blue-800 mb-2">Debug Information:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Products:</span> {products.length}
              </div>
              <div>
                <span className="font-medium">Men's Products:</span> {products.filter(p => p.category === 'Men').length}
              </div>
              <div>
                <span className="font-medium">Women's Products:</span> {products.filter(p => p.category === 'Women').length}
              </div>
              <div>
                <span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium">Token:</span> {token ? '✅ Present' : '❌ Missing'}
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mb-4 flex gap-4">
            <button 
              onClick={fetchProducts} 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Product List'}
            </button>
            <button 
              onClick={() => navigateToCategory('Men')} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              View Men's Page
            </button>
            <button 
              onClick={() => navigateToCategory('Women')} 
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors font-medium"
            >
              View Women's Page
            </button>
          </div>
          
          {/* Show form only for authenticated users */}
          {token && (
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="mb-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editingProduct ? editingProduct.title : newProduct.title}
                    onChange={handleInputChange}
                    placeholder="Product title"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  name="imageSrc"
                  value={editingProduct ? editingProduct.imageSrc : newProduct.imageSrc}
                  onChange={handleInputChange}
                  placeholder="Image URL"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">Image Preview:</p>
                <div className="border rounded-md p-2 w-32 h-32 flex items-center justify-center">
                  <img 
                    src={editingProduct ? editingProduct.imageSrc : newProduct.imageSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkludmFsaWQgVVJMPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
              </div>

              {/* Size Checkboxes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <label key={size} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="size"
                        value={size}
                        checked={(editingProduct ? editingProduct.size || [] : newProduct.size || []).includes(size)}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Length Checkboxes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                <div className="flex flex-wrap gap-3">
                  {['Short', 'Regular', 'Long', 'Extra Long'].map(length => (
                    <label key={length} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="length"
                        value={length}
                        checked={(editingProduct ? editingProduct.length || [] : newProduct.length || []).includes(length)}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{length}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Checkboxes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-3">
                  {['Black', 'Blue', 'Gray', 'White', 'Dark Blue', 'Red', 'Green', 'Saddle Brown', 'Khaki'].map(color => (
                    <label key={color} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="color"
                        value={color}
                        checked={(editingProduct ? editingProduct.color || [] : newProduct.color || []).includes(color)}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {/* Brand Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <select
                    name="brand"
                    value={editingProduct ? editingProduct.brand : newProduct.brand}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Brand</option>
                    <option value="Levi's">Levi's</option>
                    <option value="Wrangler">Wrangler</option>
                    <option value="Calvin Klein">Calvin Klein</option>
                    <option value="Tommy Hilfiger">Tommy Hilfiger</option>
                  </select>
                </div>

                {/* Material Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
                  <select
                    name="material"
                    value={editingProduct ? editingProduct.material : newProduct.material}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Material</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Denim">Denim</option>
                    <option value="Polyester">Polyester</option>
                    <option value="Wool">Wool</option>
                  </select>
                </div>

                {/* Style Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style *</label>
                  <select
                    name="style"
                    value={editingProduct ? editingProduct.style : newProduct.style}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Style</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                    <option value="Active">Active</option>
                    <option value="Streetwear">Streetwear</option>
                  </select>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={editingProduct ? editingProduct.category : newProduct.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Current Products List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Products ({products.length})</h2>
            <div className="mb-4">
              <p className="text-gray-600">
                Products are automatically sorted by category. Navigate to the Men's or Women's pages to see them in their respective sections.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                  {/* Category Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium z-10 ${
                    product.category === 'Men' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {product.category}
                  </div>
                  
                  <img 
                    src={product.imageSrc} 
                    alt={product.title} 
                    className="w-full h-48 object-cover" 
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Price:</span> ${product.price.toFixed(2)}</p>
                      <p><span className="font-medium">Category:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          product.category === 'Men' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {product.category}
                        </span>
                      </p>
                      <p><span className="font-medium">Size:</span> {Array.isArray(product.size) ? product.size.join(', ') : (product.size || 'N/A')}</p>
                      <p><span className="font-medium">Color:</span> {Array.isArray(product.color) ? product.color.join(', ') : (product.color || 'N/A')}</p>
                      <p><span className="font-medium">Brand:</span> {product.brand}</p>
                      <p><span className="font-medium">Material:</span> {product.material}</p>
                      <p><span className="font-medium">Length:</span> {Array.isArray(product.length) ? product.length.join(', ') : (product.length || 'N/A')}</p>
                      <p><span className="font-medium">Style:</span> {product.style}</p>
                    </div>
                    {token && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setEditingProduct({ ...product })}
                          className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {products.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found. Add some products to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;