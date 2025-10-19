import React, { useState, useEffect, useCallback } from 'react';
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
    priceRange: [0, 999999999], // Start with unlimited price range
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async (retryCount = 0) => {
    console.log('📥 WOMEN: Fetching products...');
    console.log('📥 WOMEN: Request URL:', 'http://localhost:5000/api/products?category=Women');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/products?category=Women');
      
      console.log('📡 WOMEN: Response status:', response.status);
      console.log('📡 WOMEN: Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 WOMEN: Raw response data:', data);
      console.log('✅ WOMEN: Fetched', data.length, 'products');
      
      if (data.length > 0) {
        console.log('📦 WOMEN: First product:', data[0]);
      }
      
      setProducts(data || []);
      setError('');
    } catch (err) {
      console.error('❌ WOMEN: Error fetching products:', err);
      console.error('❌ WOMEN: Error details:', err.message, err.stack);
      setError('Server error. Please try again.');
      
      // Retry mechanism for network errors
      if (retryCount < 3) {
        console.log(`🔄 WOMEN: Retrying fetch... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProducts(retryCount + 1), 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
      console.log('🏁 WOMEN: Fetch completed. Loading:', false);
    }
  }, []);

  // Function to check for localStorage updates - moved outside useEffect so it can be reused
  const checkForRecentUpdates = useCallback(() => {
    console.log('🔍 WOMEN: Checking for recent updates in localStorage...');
    const productUpdate = localStorage.getItem('productUpdated');
    if (productUpdate) {
      try {
        const update = JSON.parse(productUpdate);
        const timeDiff = Date.now() - update.timestamp;
        console.log('📋 WOMEN: Found localStorage update:', update);
        console.log(`⏱️ WOMEN: Time difference: ${timeDiff}ms (${timeDiff/1000}s)`);
        
        // If update is less than 2 minutes old and for this category
        if (timeDiff < 120000 && update.category === 'Women') {
          console.log(`🔄 WOMEN: Found recent product ${update.action}, refreshing...`);
          fetchProducts();
          // Clear the flag after processing
          localStorage.removeItem('productUpdated');
          console.log('🧹 WOMEN: Cleared localStorage flag');
          return true; // Indicate that we found and processed an update
        } else {
          console.log(`❌ WOMEN: Update not applicable - timeDiff: ${timeDiff}, category: ${update.category}`);
          if (timeDiff >= 120000) {
            // Clean up old flags
            localStorage.removeItem('productUpdated');
            console.log('🧹 WOMEN: Removed expired localStorage flag');
          }
        }
      } catch (error) {
        console.error('Error parsing productUpdate from localStorage:', error);
        localStorage.removeItem('productUpdated');
      }
    } else {
      console.log('🚫 WOMEN: No localStorage update found');
    }
    return false;
  }, [fetchProducts]);

  useEffect(() => {
    console.log('🚀 WOMEN: Component mounted/updated');
    
    // Check for updates first, then do normal fetch if no update was processed
    const foundUpdate = checkForRecentUpdates();
    if (!foundUpdate) {
      console.log('📥 WOMEN: No recent update found, doing normal fetch');
      fetchProducts();
    }

    const handleProductAdded = (event) => {
      console.log('📢 WOMEN: Received productAdded event:', event.detail);
      if (event.detail && event.detail.category === 'Women') {
        console.log('🔄 WOMEN: Product added, refreshing products...');
        fetchProducts();
      } else {
        console.log('⏭️ WOMEN: Ignoring event for category:', event.detail?.category);
      }
    };

    const handleProductUpdated = (event) => {
      console.log('📢 WOMEN: Received productUpdated event:', event.detail);
      if (event.detail && event.detail.category === 'Women') {
        console.log('🔄 WOMEN: Product updated, refreshing products...');
        fetchProducts();
      }
    };

    const handleProductDeleted = (event) => {
      console.log('📢 WOMEN: Received productDeleted event:', event.detail);
      if (event.detail && event.detail.category === 'Women') {
        console.log('🔄 WOMEN: Product deleted, refreshing products...');
        fetchProducts();
      }
    };

    window.addEventListener('productAdded', handleProductAdded);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productDeleted', handleProductDeleted);
    
    console.log('✅ WOMEN: Event listeners registered');
    
    // Add focus listener to check for updates when page comes into focus
    const handleWindowFocus = () => {
      console.log('👁️ WOMEN: Window focused, checking for updates...');
      checkForRecentUpdates();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    // Backup: Poll localStorage every 5 seconds as a fallback
    const pollInterval = setInterval(() => {
      const productUpdate = localStorage.getItem('productUpdated');
      if (productUpdate) {
        try {
          const update = JSON.parse(productUpdate);
          const timeDiff = Date.now() - update.timestamp;
          if (timeDiff < 120000 && update.category === 'Women') {
            console.log('🔄 WOMEN: Polling detected update, refreshing...');
            fetchProducts();
            localStorage.removeItem('productUpdated');
          }
        } catch (error) {
          console.error('Error in polling:', error);
        }
      }
    }, 5000);
    
    // Cleanup event listeners
    return () => {
      console.log('🧹 WOMEN: Cleaning up event listeners');
      window.removeEventListener('productAdded', handleProductAdded);
      window.removeEventListener('productUpdated', handleProductUpdated);
      window.removeEventListener('productDeleted', handleProductDeleted);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(pollInterval);
    };
  }, [fetchProducts, checkForRecentUpdates]);

  const filteredProducts = products.filter((product) => {
    const styleMatch = filters.styles.length === 0 || filters.styles.includes(product.style);
    const sizeMatch = filters.sizes.length === 0 || filters.sizes.some(size => product.size.includes(size));
    const lengthMatch = filters.lengths.length === 0 || filters.lengths.some(length => product.length.includes(length));
    const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);
    const materialMatch = filters.materials.length === 0 || filters.materials.includes(product.material);
    const colorMatch = filters.colors.length === 0 || filters.colors.some((color) => product.color.includes(color));
    const priceMatch = product.price <= filters.priceRange[1] && product.price >= filters.priceRange[0];
    return styleMatch && sizeMatch && lengthMatch && brandMatch && materialMatch && colorMatch && priceMatch;
  });

  console.log('🎨 WOMEN: Rendering - Total products:', products.length, 'Filtered:', filteredProducts.length);
  console.log('🎨 WOMEN: Active filters:', filters);
  console.log('🎨 WOMEN: Loading state:', loading);
  console.log('🎨 WOMEN: Error state:', error);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return filters.styles.length > 0 || 
           filters.sizes.length > 0 || 
           filters.lengths.length > 0 || 
           filters.brands.length > 0 || 
           filters.materials.length > 0 || 
           filters.colors.length > 0 || 
           filters.priceRange[0] !== 0 || 
           filters.priceRange[1] !== 999999999;
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setFilters({
      styles: [],
      sizes: [],
      lengths: [],
      brands: [],
      materials: [],
      colors: [],
      priceRange: [0, 999999999], // Allow ANY price
    });
    console.log('🧹 WOMEN: All filters cleared - price range set to unlimited');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow flex">
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div className="flex-1 p-4">
          {/* Title with Clear Filters Button */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Women's Collection</h1>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all"
              >
                🗑️ Clear All Filters
              </button>
            )}
          </div>
          
          <ProductGrid products={filteredProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WomenPage;
