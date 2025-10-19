import React from 'react';

// Color mapping for proper CSS colors
const colorMap = {
  'Black': '#000000',
  'Blue': '#0066CC',
  'Gray': '#808080',
  'White': '#FFFFFF',
  'Dark Blue': '#003366',
  'Red': '#CC0000',
  'Green': '#006600',
  'Saddle Brown': '#8B4513',
  'Khaki': '#F0E68C'
};

const ColorSelector = ({ colors = [], selectedColor, onSelectColor }) => {
  // Ensure colors is always an array
  const colorArray = Array.isArray(colors) ? colors : [];
  
  return (
    <div className="flex items-center space-x-2 mt-2">
      {colorArray.map((color) => (
        <div
          key={color}
          style={{ 
            backgroundColor: colorMap[color] || color,
            border: color === 'White' ? '2px solid #ccc' : '1px solid #ddd'
          }}
          className={`w-6 h-6 rounded-full cursor-pointer ${
            selectedColor === color ? 'ring-2 ring-black' : ''
          } hover:ring-2 hover:ring-gray-400 transition-all`}
          title={color}
          onClick={() => onSelectColor && onSelectColor(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};

export default ColorSelector;