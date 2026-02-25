import React from 'react';
import { useNavigate } from 'react-router-dom';
import ColorSelector from './ColorSelector';
import ErrorBoundary from '../ErrorBoundary';

const ProductGrid = ({ products }) => {
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Helper function to safely display array values
  const displayArrayValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || 'N/A';
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleProductClick(product._id)}
        >
          <img
            src={product.imageSrc}
            alt={product.alt || product.title}
            className="w-full h-48 object-cover mb-2 rounded"
            onError={(e) => {
              // Fallback to a placeholder image if the original fails to load
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
            }}
          />
          <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
          <p className="text-xl font-bold text-blue-600 mb-2">${product.price.toFixed(2)}</p>

          {/* Product details */}
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Brand:</span> {product.brand}</p>
            <p><span className="font-medium">Style:</span> {product.style}</p>
            <p><span className="font-medium">Material:</span> {product.material}</p>
            <p><span className="font-medium">Size:</span> {displayArrayValue(product.size)}</p>
            <p><span className="font-medium">Length:</span> {displayArrayValue(product.length)}</p>
            <p><span className="font-medium">Colors:</span> {displayArrayValue(product.color)}</p>
          </div>
          
          {/* Color selector */}
          <ErrorBoundary>
            <ColorSelector colors={product.color || []} />
          </ErrorBoundary>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;