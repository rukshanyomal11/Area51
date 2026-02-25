import React from 'react';
import Hero from '../../assets/video/Hero.mp4';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative isolate w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={Hero} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/70"></div>
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-2xl text-center md:text-left animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white">
            New Season
          </span>
          <h2 className="display-font mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Short Stories, Written in Denim
          </h2>
          <p className="mt-5 text-base text-white/80 sm:text-lg">
            Explore denim for the whole family. From women&apos;s trends to men&apos;s essentials and kids&apos; everyday comfort,
            we&apos;ve got you covered in pieces that last.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
            <Link
              to="/men"
              className="rounded-full bg-red-500 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400"
            >
              Shop Men
            </Link>
            <Link
              to="/women"
              className="rounded-full border border-white/60 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:text-white"
            >
              Shop Women
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.3em] text-white/70 md:justify-start">
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-red-400"></span>
              Free Shipping $75+
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-red-400"></span>
              Easy Returns
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-red-400"></span>
              Premium Denim
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
