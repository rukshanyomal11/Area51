import React, { useState } from 'react';

const FilterSidebar = ({ filters, setFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCheckboxChange = (category, value) => {
    setFilters((prev) => {
      const updatedCategory = prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updatedCategory };
    });
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters((prev) => ({
      ...prev,
      priceRange: [0, value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      styles: [],
      sizes: [],
      lengths: [],
      brands: [],
      materials: [],
      colors: [],
      priceRange: [0, 200],
    });
  };

  // Updated color mappings with real/standard names
  const colorOptions = {
    'Black': 'Black',
    'Blue': 'Blue',
    'Gray': 'Gray',
    'White': 'White',
    'Dark Blue': 'Dark Blue',
    'Red': 'Red',
    'Green': 'Green',
    'Saddle Brown': 'Saddle Brown',
    'Khaki': 'Khaki'
  };

  return (
    <div className="w-64 p-4 bg-white shadow-lg rounded-lg">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="text-xl font-bold mb-4 border-b pb-2 w-full text-left"
      >
        Filters {isExpanded ? '▲' : '▼'}
      </button>

      {isExpanded && (
        <div className="space-y-6">
          {/* Style */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Style</h3>
            <div className="space-y-2">
              {['Casual', 'Formal', 'Active', 'Streetwear'].map((style) => (
                <label key={style} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.styles.includes(style)}
                    onChange={() => handleCheckboxChange('styles', style)}
                    className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span>{style}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Size</h3>
            <div className="space-y-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <label key={size} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.sizes.includes(size)}
                    onChange={() => handleCheckboxChange('sizes', size)}
                    className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Length</h3>
            <div className="space-y-2">
              {['Short', 'Regular', 'Long', 'Extra Long'].map((length) => (
                <label key={length} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.lengths.includes(length)}
                    onChange={() => handleCheckboxChange('lengths', length)}
                    className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span>{length}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Color</h3>
            <div className="space-y-2">
              {Object.entries(colorOptions).map(([color, name]) => (
                <label key={color} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => handleCheckboxChange('colors', color)}
                    className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span style={{ backgroundColor: color, width: '15px', height: '15px', display: 'inline-block', border: '1px solid #ccc' }}></span>
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Brand</h3>
            <div className="space-y-2">
              {['Levi’s', 'Wrangler', 'Calvin Klein', 'Tommy Hilfiger'].map((brand) => (
                <label key={brand} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleCheckboxChange('brands', brand)}
                    className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Material</h3>
            <div className="space-y-2">
              {['Cotton', 'Denim', 'Polyester', 'Wool'].map((material) => (
                <label key={material} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(material)}
                    onChange={() => handleCheckboxChange('materials', material)}
                    className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span>{material}</span>
                </label>
              ))}
            </div>
          </div>

          

          {/* Price */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-700">Price</h3>
            <input
              type="range"
              min="0"
              max="200"
              value={filters.priceRange[1]}
              onChange={handlePriceChange}
              className="w-full accent-blue-600"
            />
            <p className="text-sm text-gray-600">0 - ${filters.priceRange[1]}</p>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;