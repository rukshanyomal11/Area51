import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Denim Download Section */}
        <div className="text-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
          <img
            src="https://images.pexels.com/photos/33167553/pexels-photo-33167553.jpeg"
            alt="Denim Download"
            className="mx-auto mb-4 rounded-md"
          />
          <h3 className="text-2xl font-bold text-gray-800">DENIM DOWNLOAD</h3>
          <button
            onClick={() => navigate('/men')}
            className="bg-black text-white px-6 py-2 mt-4 rounded hover:bg-gray-800 transition duration-300"
          >
            SHOP NOW
          </button>
        </div>

        {/* Look West Section */}
        <div className="text-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
          <img
            src="https://images.pexels.com/photos/4486396/pexels-photo-4486396.jpeg"
            alt="Look West"
            className="mx-auto mb-4 rounded-md"
          />
          <h3 className="text-2xl font-bold text-gray-800">LOOK WEST</h3>
          <button
            onClick={() => navigate('/women')}
            className="bg-black text-white px-6 py-2 mt-4 rounded hover:bg-gray-800 transition duration-300"
          >
            SHOP NOW
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedSection;
