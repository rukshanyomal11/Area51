import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FilterSidebar from '../components/men/FilterSidebar';
import ProductGrid from '../components/men/ProductGrid';
import Footer from '../components/Footer';

const MenPage = () => {
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
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/products?category=Men');
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Server error. Please try again.');
      
      // Retry mechanism for network errors
      if (retryCount < 3) {
        setTimeout(() => fetchProducts(retryCount + 1), 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to check for localStorage updates
  const checkForRecentUpdates = useCallback(() => {
    const productUpdate = localStorage.getItem('productUpdated');
    if (productUpdate) {
      try {
        const update = JSON.parse(productUpdate);
        const timeDiff = Date.now() - update.timestamp;
        
        // If update is less than 2 minutes old and for this category
        if (timeDiff < 120000 && update.category === 'Men') {
          fetchProducts();
          localStorage.removeItem('productUpdated');
          return true;
        } else {
          if (timeDiff >= 120000) {
            localStorage.removeItem('productUpdated');
          }
        }
      } catch (error) {
        console.error('Error parsing localStorage update:', error);
        localStorage.removeItem('productUpdated');
      }
    }
    return false;
  }, [fetchProducts]);

  useEffect(() => {
    const foundUpdate = checkForRecentUpdates();
    if (!foundUpdate) {
      fetchProducts();
    }

    const handleProductAdded = (event) => {
      if (event.detail && event.detail.category === 'Men') {
        fetchProducts();
      }
    };

    const handleProductUpdated = (event) => {
      if (event.detail && event.detail.category === 'Men') {
        fetchProducts();
      }
    };

    const handleProductDeleted = (event) => {
      if (event.detail && event.detail.category === 'Men') {
        fetchProducts();
      }
    };

    window.addEventListener('productAdded', handleProductAdded);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productDeleted', handleProductDeleted);
    
    const handleWindowFocus = () => {
      checkForRecentUpdates();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    // Backup: Poll localStorage every 5 seconds
    const pollInterval = setInterval(() => {
      const productUpdate = localStorage.getItem('productUpdated');
      if (productUpdate) {
        try {
          const update = JSON.parse(productUpdate);
          const timeDiff = Date.now() - update.timestamp;
          if (timeDiff < 120000 && update.category === 'Men') {
            fetchProducts();
            localStorage.removeItem('productUpdated');
          }
        } catch (error) {
          console.error('Error in polling:', error);
        }
      }
    }, 5000);
    
    return () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button 
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setError('');
                  setLoading(true);
                  fetchProducts();
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    console.log('🧹 MEN: All filters cleared - price range set to unlimited');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow flex">
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div className="flex-1 p-4">
          {/* Title with Clear Filters Button */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Men's Collection</h1>
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

export default MenPage;
