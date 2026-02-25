import React from 'react';
import { Link } from 'react-router-dom';

const products = [
  {
    name: "Women's Jeans",
    img: "https://images.pexels.com/photos/33149303/pexels-photo-33149303.jpeg",
    href: "/women",
    tag: "Curve & Classic",
  },
  {
    name: "Men's Jeans",
    img: "https://images.pexels.com/photos/33167521/pexels-photo-33167521.jpeg",
    href: "/men",
    tag: "Modern Fits",
  },
  {
    name: "Women's Shorts",
    img: "https://images.pexels.com/photos/8734264/pexels-photo-8734264.jpeg",
    href: "/women",
    tag: "Warm Weather",
  },
  {
    name: "Men's Shorts",
    img: "https://images.pexels.com/photos/18178103/pexels-photo-18178103.jpeg",
    href: "/men",
    tag: "Relaxed Days",
  },
  {
    name: "Women's Tops",
    img: "https://images.pexels.com/photos/33179926/pexels-photo-33179926.jpeg",
    href: "/women",
    tag: "Everyday Staples",
  },
];

const ProductGrid = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-500">Shop By Category</p>
            <h3 className="display-font mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Everyday essentials, elevated
            </h3>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Mix, match, and build a wardrobe that works hard. Explore the fits and silhouettes built for comfort and style.
            </p>
          </div>
          <Link
            to="/sale"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700 transition hover:text-red-500"
          >
            View Sale
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {products.map((product, index) => (
            <Link
              key={product.name}
              to={product.href}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl animate-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
              aria-label={`Shop ${product.name}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.img}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
              <div className="p-4">
                <p className="text-base font-semibold text-gray-900">{product.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">{product.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
