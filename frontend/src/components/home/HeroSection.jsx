import React from 'react';
import Hero from '../../assets/video/Hero.mp4';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative w-full py-16 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={Hero} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <h2 className="text-5xl font-bold mb-4">SHORT STORIES</h2>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          "Explore denim for the whole family - stylish, durable, and made for women's trends to men's essentials and kids' everyday comfort, we've got you covered."
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/men" className="bg-white text-black px-6 py-2 rounded">SHOP MEN</Link>
          <Link to="/women" className="bg-white text-black px-6 py-2 rounded">SHOP WOMEN</Link>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;