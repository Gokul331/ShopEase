import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryAPI } from "../services/api";
import { 
  FiGrid, 
  FiLayers, 
  FiArrowRight, 
  FiZap,
  FiRefreshCw,
  FiStar,
  FiChevronRight
} from "react-icons/fi";

const placeholderImage = (seed, w = 400, h = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await categoryAPI.list();
        if (mounted) {
          const activeCategories = (res.data || [])
            .filter(cat => cat.is_active !== false)
            .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
          
          setCategories(activeCategories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        if (mounted) {
          setError("Unable to load categories. Please try again.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.slug}`);
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.list();
        const activeCategories = (res.data || [])
          .filter(cat => cat.is_active !== false)
          .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        
        setCategories(activeCategories);
      } catch (err) {
        setError("Failed to load categories. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  };

  // Get featured categories (first 6 for better grid layout)
  const displayCategories = categories.slice(0, 6);

  if (loading) {
    return (
      <section id="categories" className="bg-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FiGrid className="text-indigo-600 text-xl md:text-2xl" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Browse Categories</h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Exploring our product categories...
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-xl md:rounded-2xl mb-2 md:mb-3"></div>
                <div className="h-3 md:h-4 bg-gray-200 rounded w-4/5 mx-auto mb-1 md:mb-2"></div>
                <div className="h-2 md:h-3 bg-gray-200 rounded w-3/5 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="categories" className="bg-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <FiZap className="text-red-500 text-2xl md:text-3xl" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Unable to Load Categories</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-md mx-auto px-4">{error}</p>
            <button
              onClick={retryFetch}
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm md:text-base"
            >
              <FiRefreshCw className="text-base md:text-lg" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section id="categories" className="bg-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <FiLayers className="text-gray-400 text-2xl md:text-3xl" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">No Categories Available</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 px-4">We're setting up our categories. Please check back later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="bg-white py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <FiGrid className="text-sm md:text-lg" />
            SHOP BY CATEGORY
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Browse Categories
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4 md:px-0">
            Explore our wide range of product categories. Find exactly what you're looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {displayCategories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer border border-gray-100 overflow-hidden"
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Category Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={category.image || placeholderImage(category.slug || category.id)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = placeholderImage(category.slug || category.id);
                  }}
                />
                
                {/* Featured Badge */}
                {category.is_featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FiStar className="text-xs" />
                    <span className="hidden sm:inline">Featured</span>
                  </div>
                )}

                {/* Hover Arrow */}
                <div className={`absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  hoveredCategory === category.id 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 translate-x-2 scale-95'
                }`}>
                  <FiArrowRight className="text-gray-700 text-xs md:text-sm" />
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Category Info */}
              <div className="p-3 md:p-4 text-center">
                <h3 className="font-semibold text-gray-900 text-xs md:text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200 mb-1 min-h-[2rem] md:min-h-[2.5rem] flex items-center justify-center">
                  {category.name}
                </h3>
                {category.product_count && (
                  <p className="text-xs text-gray-500 mt-1">
                    {category.product_count} products
                  </p>
                )}
              </div>

              {/* Active Border Effect */}
              <div className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-transparent group-hover:border-indigo-500/20 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* View All Categories Button */}
        {categories.length > 6 && (
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={() => navigate("/categories")}
              className="group inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 border border-indigo-600 text-indigo-600 rounded-lg md:rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base"
            >
              <FiGrid className="text-base md:text-lg" />
              View All Categories ({categories.length})
              <FiChevronRight className="text-base md:text-lg transform group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;