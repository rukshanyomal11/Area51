import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: 'Denim Download',
      eyebrow: "Men's Edit",
      description: 'Clean fits, sturdy washes, and modern silhouettes made for every day.',
      image: 'https://images.pexels.com/photos/33167553/pexels-photo-33167553.jpeg',
      cta: 'Shop Men',
      href: '/men',
    },
    {
      title: 'Look West',
      eyebrow: "Women's Edit",
      description: 'Sun-washed palettes and soft structure for effortless off-duty styling.',
      image: 'https://images.pexels.com/photos/4486396/pexels-photo-4486396.jpeg',
      cta: 'Shop Women',
      href: '/women',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-100 via-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-500">Featured Edit</p>
            <h3 className="display-font mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              The moodboard for right now
            </h3>
          </div>
          <p className="max-w-xl text-sm text-gray-600">
            Two standout stories designed to anchor your wardrobe with texture, structure, and confidence.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 animate-fade-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"></div>
              <div className="relative flex min-h-[360px] flex-col justify-end p-6 text-white sm:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">{feature.eyebrow}</p>
                <h4 className="display-font mt-2 text-3xl font-semibold sm:text-4xl">{feature.title}</h4>
                <p className="mt-3 max-w-md text-sm text-white/80">{feature.description}</p>
                <button
                  onClick={() => navigate(feature.href)}
                  className="mt-6 w-fit rounded-full bg-red-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400"
                >
                  {feature.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
