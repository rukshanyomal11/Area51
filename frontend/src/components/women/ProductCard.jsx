import React from 'react';
import { useNavigate } from 'react-router-dom';
import ColorSelector from './ColorSelector';

const ProductCard = ({ imageSrc, alt, title, price, colors, isBestSeller, style, size, length, brand, material }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${encodeURIComponent(title)}`, { state: { imageSrc, alt, title, price, colors, isBestSeller, style, size, length, brand, material } });
  };

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow relative cursor-pointer" onClick={handleClick}>
      <img src={imageSrc} alt={alt} className="w-full h-48 object-cover mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">${price.toFixed(2)}</p>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-sm font-medium text-gray-700">Colors:</span>
        <ColorSelector colors={colors} />
      </div>
    </div>
  );
};

export default ProductCard;
