import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FilterSidebar from '../components/women/FilterSidebar';
import ProductGrid from '../components/women/ProductGrid';
import Footer from '../components/Footer';

const WomenPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    styles: [],
    sizes: [],
    lengths: [],
    brands: [],
    materials: [],
    colors: [],
    priceRange: [0, 200],
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const abortController = React.useRef(null);

  useEffect(() => {
    fetchProducts();
    
    const interval = setInterval(() => {
      fetchProducts();
    }, 5000); // Polling every 5 seconds

    return () => {
      clearInterval(interval);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const fetchProducts = async () => {
    // Cancel any previous ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setLoading(true);
    setError('');
    
    try {
      const baseUrl = 'http://localhost:5000/api/products';
      const categoryParam = 'category=Women';
      const timestamp = Date.now();
      const url = `${baseUrl}?${categoryParam}&_t=${timestamp}`;
      
      const response = await fetch(url, {
        signal: abortController.current.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
        if (response.status === 401) {
          console.error('❌ WOMEN PAGE: Authentication required');
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 WOMEN PAGE: Received data:', data);
      console.log('📦 WOMEN PAGE: Number of products:', data?.length || 0);
      
      // FIXED: Additional validation for Women's products
      const womenProducts = data.filter(product => {
        const isValidWomenProduct = product.category === 'Women';
        if (!isValidWomenProduct) {
          console.warn('⚠️ WOMEN PAGE: Non-women product found:', {
            id: product._id,
            title: product.title,
            category: product.category
          });
        }
        return isValidWomenProduct;
      });
      
      console.log('👗 WOMEN PAGE: Validated women\'s products:', womenProducts.length);
      console.log('👗 WOMEN PAGE: Sample products:', womenProducts.slice(0, 3).map(p => ({
        id: p._id,
        title: p.title,
        category: p.category
      })));
      
      setProducts(womenProducts);
      setError('');
      
      if (womenProducts.length === 0 && data.length > 0) {
        console.warn('⚠️ WOMEN PAGE: No women\'s products found, but other products exist');
        setError('No women\'s products found. Check if products are properly categorized.');
      }
      
    } catch (err) {
      console.error('💥 WOMEN PAGE: Fetch Error:', err);
      setError('Server error. Please try again.');
      
      // Retry mechanism for network errors
      if (retryCount < 3) {
        console.log(`🔄 WOMEN PAGE: Retrying fetch... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProducts(retryCount + 1), 2000 * (retryCount + 1));
        return; // Don't set loading to false yet
      }
    } finally {
      setLoading(false);
      console.log('🏁 WOMEN PAGE: Fetch completed');
    }
  };

  useEffect(() => {
    console.log('🚀 WOMEN PAGE: Component mounted or lastUpdate changed');
    fetchProducts();
    
    // FIXED: Enhanced event listeners with better error handling
    const handleProductAdded = (event) => {
      console.log('📢 WOMEN PAGE: Product added event received:', event.detail);
      if (event.detail?.category === 'Women') {
        console.log('👗 WOMEN PAGE: New women\'s product added, refreshing...');
        setLastUpdate(Date.now()); // Trigger re-fetch through lastUpdate change
      }
    };
    
    const handleProductUpdated = (event) => {
      console.log('📢 WOMEN PAGE: Product updated event received:', event.detail);
      if (event.detail?.category === 'Women') {
        console.log('👗 WOMEN PAGE: Women\'s product updated, refreshing...');
        setLastUpdate(Date.now()); // Trigger re-fetch through lastUpdate change
      }
    };
    
    const handleProductDeleted = (event) => {
      console.log('📢 WOMEN PAGE: Product deleted event received:', event.detail);
      if (event.detail?.category === 'Women') {
        console.log('👗 WOMEN PAGE: Women\'s product deleted, refreshing...');
        setLastUpdate(Date.now()); // Trigger re-fetch through lastUpdate change
      }
    };
    
    // Add event listeners
    window.addEventListener('productAdded', handleProductAdded);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productDeleted', handleProductDeleted);
    
    // Cleanup event listeners
    return () => {
      console.log('🧹 WOMEN PAGE: Cleaning up event listeners');
      window.removeEventListener('productAdded', handleProductAdded);
      window.removeEventListener('productUpdated', handleProductUpdated);
      window.removeEventListener('productDeleted', handleProductDeleted);
    };
  }, []);

  // FIXED: Enhanced filtering with better validation
  const filteredProducts = products.filter((product) => {
    // Ensure product has required properties
    if (!product || !product.category) {
      console.warn('⚠️ WOMEN PAGE: Invalid product found:', product);
      return false;
    }
    
    // Double-check category (should already be filtered, but extra safety)
    if (product.category !== 'Women') {
      console.warn('⚠️ WOMEN PAGE: Non-women product in filter:', {
        id: product._id,
        title: product.title,
        category: product.category
      });
      return false;
    }
    
    const styleMatch = filters.styles.length === 0 || filters.styles.includes(product.style);
    const sizeMatch = filters.sizes.length === 0 || 
      (Array.isArray(product.size) && filters.sizes.some(size => product.size.includes(size)));
    const lengthMatch = filters.lengths.length === 0 || 
      (Array.isArray(product.length) && filters.lengths.some(length => product.length.includes(length)));
    const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);
    const materialMatch = filters.materials.length === 0 || filters.materials.includes(product.material);
    const colorMatch = filters.colors.length === 0 || 
      (Array.isArray(product.color) && filters.colors.some(color => product.color.includes(color)));
    const priceMatch = product.price <= filters.priceRange[1] && product.price >= filters.priceRange[0];
    
    return styleMatch && sizeMatch && lengthMatch && brandMatch && materialMatch && colorMatch && priceMatch;
  });

  console.log('🔍 WOMEN PAGE: Filtered products:', filteredProducts.length, 'out of', products.length);

  // Enhanced loading and error states
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl">Loading Women's Products...</p>
            <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button 
              onClick={() => fetchProducts()}
              className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow flex">
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Women's Collection</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </span>
              <button 
                onClick={() => fetchProducts()}
                disabled={loading}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded text-sm">
              <strong>Debug:</strong> Total: {products.length} | Filtered: {filteredProducts.length} | 
              Categories: {products.map(p => p.category).join(', ')}
            </div>
          )}
          
          <ProductGrid products={filteredProducts} />
          
          {filteredProducts.length === 0 && products.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                No products match your current filters.
              </p>
              <button 
                onClick={() => setFilters({
                  styles: [],
                  sizes: [],
                  lengths: [],
                  brands: [],
                  materials: [],
                  colors: [],
                  priceRange: [0, 200],
                })}
                className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                No women's products available at the moment.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WomenPage;