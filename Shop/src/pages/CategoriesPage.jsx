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
  FiChevronRight
} from "react-icons/fi";

const placeholderImage = (seed, w = 400, h = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
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
    .filter(category => 
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-8 animate-pulse">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-2 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>

          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="w-32 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="w-96 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <div className="w-64 h-6 bg-gray-200 rounded mx-auto"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 animate-pulse">
            <div className="w-64 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-48 h-12 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Categories Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(18)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
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
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiZap className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Categories</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={retryFetch}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiRefreshCw className="text-lg" />
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
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLayers className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Categories Available</h3>
            <p className="text-gray-600 mb-6">Check back later for new categories.</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiHome className="text-lg" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <FiHome className="text-base" />
            Home
          </button>
          <FiChevronRight className="text-gray-400" />
          <span className="text-indigo-600 font-medium">All Categories</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FiGrid className="text-lg" />
            COMPLETE COLLECTION
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Product Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our complete collection of {categories.length} categories. Find exactly what you're looking for.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 text-lg" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="product_count">Most Products</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAndSortedCategories.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{categories.length}</span> categories
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6 mb-12">
          {filteredAndSortedCategories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-200"
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Category Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={category.image || placeholderImage(category.slug || category.id)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
               

                {/* Hover Arrow */}
                <div className={`absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  hoveredCategory === category.id 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 translate-x-2 scale-95'
                }`}>
                  <FiArrowRight className="text-gray-700 text-sm" />
                </div>
              </div>

              {/* Category Info */}
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200 mb-1">
                  {category.name}
                </h3>
                
              
              </div>

              </div>
          ))}
        </div>

        {/* No Results State */}
        {filteredAndSortedCategories.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">
              No categories match "<span className="font-medium">{searchTerm}</span>"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

      
      </div>

      {/* Custom CSS */}
      <style jsx = {true}>{`
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