import React from 'react';

const products = [
  {
    name: "Women's Jeans",
    img: "https://images.pexels.com/photos/33149303/pexels-photo-33149303.jpeg",
  },
  {
    name: "Men's Jeans",
    img: "https://images.pexels.com/photos/33167521/pexels-photo-33167521.jpeg",
  },
  {
    name: "Women's Shorts",
    img: "https://images.pexels.com/photos/8734264/pexels-photo-8734264.jpeg",
  },
  {
    name: "Men's Shorts",
    img: "https://images.pexels.com/photos/18178103/pexels-photo-18178103.jpeg",
  },
  {
    name: "Women's Tops",
    img: "https://images.pexels.com/photos/33179926/pexels-photo-33179926.jpeg",
  },
];

const ProductGrid = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {products.map((product, index) => (
          <div key={index} className="text-center">
            <img
              src={product.img}
              alt={product.name}
              className="mx-auto mb-3 rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            />
            <p className="text-lg font-medium text-gray-800">{product.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
