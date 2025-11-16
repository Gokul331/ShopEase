import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryAPI } from "../services/api";
import {
  FiGrid,
  FiLayers,
  FiArrowRight,
  FiZap,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiHome,
  FiChevronRight,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { getCategoryImage } from "../utils/imageUtils";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await categoryAPI.list();
        if (mounted) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Unable to load categories. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter(
      (category) =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name?.localeCompare(b.name);
        case "product_count":
          return (b.product_count || 0) - (a.product_count || 0);
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.slug || category.id}`);
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.list();
        setCategories(res.data || []);
      } catch (err) {
        setError("Failed to load categories. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 animate-pulse">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-2 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>

          {/* Header Skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-32 h-6 sm:h-8 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <div className="w-64 sm:w-96 h-8 sm:h-12 bg-gray-200 rounded-lg mx-auto mb-3 sm:mb-4"></div>
            <div className="w-48 sm:w-64 h-4 sm:h-6 bg-gray-200 rounded mx-auto"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center mb-6 sm:mb-8 animate-pulse">
            <div className="w-full sm:w-64 h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-full sm:w-48 h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Categories Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-xl sm:rounded-2xl mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2 mx-auto mt-1 sm:mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiZap className="text-red-500 text-xl sm:text-3xl" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Unable to Load Categories
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
              {error}
            </p>
            <button
              onClick={retryFetch}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <FiRefreshCw className="text-sm sm:text-lg" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiLayers className="text-gray-400 text-xl sm:text-3xl" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              No Categories Available
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Check back later for new categories.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <FiHome className="text-sm sm:text-lg" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <FiHome className="text-sm sm:text-base" />
            <span className="hidden xs:inline">Home</span>
          </button>
          <FiChevronRight className="text-gray-400 text-xs sm:text-sm" />
          <span className="text-indigo-600 font-medium">Categories</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <FiGrid className="text-sm sm:text-lg" />
            <span className="hidden xs:inline">COMPLETE COLLECTION</span>
            <span className="xs:hidden">CATEGORIES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            All Categories
          </h1>
          <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore our complete collection of {categories.length} categories
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center mb-6 sm:mb-8 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
          <div className="relative flex-1 w-full sm:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base sm:text-lg" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-8 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="text-sm sm:text-base" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
            >
              <FiFilter className="text-base" />
              Sort
            </button>

            {/* Desktop Sort */}
            <div className="hidden sm:flex items-center gap-2">
              <FiFilter className="text-gray-400 text-lg" />
              <span className="text-sm font-medium text-gray-700">Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden sm:block px-3 sm:px-4 py-2 text-sm sm:z-10 sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="product_count">Most Products</option>
              <option value="newest">Newest</option>
            </select>

            {/* Mobile Sort Dropdown */}
            {showFilters && (
              <div className="sm:hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Sort By
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="text-base" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setShowFilters(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                      sortBy === "name"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span>Name</span>
                    {sortBy === "name" && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <FiCheck className="text-white text-xs" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSortBy("product_count");
                      setShowFilters(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                      sortBy === "product_count"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span>Most Products</span>
                    {sortBy === "product_count" && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <FiCheck className="text-white text-xs" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSortBy("newest");
                      setShowFilters(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                      sortBy === "newest"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span>Newest First</span>
                    {sortBy === "newest" && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <FiCheck className="text-white text-xs" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full text-center py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredAndSortedCategories.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {categories.length}
            </span>{" "}
            categories
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          {filteredAndSortedCategories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer border border-gray-200"
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Category Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {getCategoryImage(category) ? (
                  <img
                    src={getCategoryImage(category)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}

                {/* Hover Arrow */}
                <div
                  className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    hoveredCategory === category.id
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 translate-x-1 sm:translate-x-2 scale-95"
                  }`}
                >
                  <FiArrowRight className="text-gray-700 text-xs sm:text-sm" />
                </div>
              </div>

              {/* Category Info */}
              <div className="p-2 sm:p-3 text-center">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200 mb-1">
                  {category.name}
                </h3>
                {category.product_count && (
                  <p className="text-xs text-gray-500">
                    {category.product_count}{" "}
                    {category.product_count === 1 ? "product" : "products"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results State */}
        {filteredAndSortedCategories.length === 0 && searchTerm && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiSearch className="text-gray-400 text-lg sm:text-2xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              No categories match "
              <span className="font-medium">{searchTerm}</span>"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .aspect-square {
          aspect-ratio: 1 / 1;
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;
