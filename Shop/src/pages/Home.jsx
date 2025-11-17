import React from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import TrendingProducts from "../components/TrendingProducts";
import Subcategories from "../components/Subcategories";
import RecentlyViewed from "../components/RecentlyViewed";

const Home = () => {
  return (
    <main className="min-h-screen mt-5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <Hero />
      </section>

      {/* Subcategories Section */}
      <section className="relative mt-3 py-8">
        <div className="max-w-7xl mx-auto sm:px-6 ">
          <Subcategories />
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Categories />
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="relative py-8 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrendingProducts />
        </div>
      </section>

      {/* Recently Viewed Section */}
      <section className="relative">
        <RecentlyViewed />
      </section>

      {/* Optional: Newsletter or CTA Section */}
      <section className="relative py-12 my-5 md:py-16 lg:py-20 bg-gradient-to-r from-blue-400 to-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Stay Updated with Latest Deals
          </h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive offers delivered
            straight to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
