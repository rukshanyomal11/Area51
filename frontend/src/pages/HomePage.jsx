import React from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../components/home/HeroSection';
import ProductGrid from '../components/home/ProductGrid';
import FeaturedSection from '../components/home/FeaturedSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <HeroSection />
        <ProductGrid />
        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
