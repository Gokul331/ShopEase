import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { recentlyViewedAPI } from "../services/api";
import { getProductImage } from "../utils/imageUtils";
import { scrollToTop } from "../utils/scrollUtils";
import {
  FiClock,
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

const RecentlyViewed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
 
      try {
        setLoading(true);
        setError(null);
        
        const response = await recentlyViewedAPI.list();
        setRecentlyViewed(response.data || []);
      } catch (err) {
        console.error("Error fetching recently viewed:", err);
        setError("Failed to load recently viewed products");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [user]);

  const handleProductClick = (productId) => {
    scrollToTop();
    navigate(`/products/${productId}`);
  };

  const handleViewAll = () => {
    scrollToTop();
    navigate("/profile");
  };

  // Don't render if user is not authenticated or no recently viewed items
  if (!user || (!loading && recentlyViewed.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <FiRefreshCw className="text-sm" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 md:px-4 md:py-2 rounded-full text-sm font-medium">
              <FiClock className="text-sm md:text-base" />
              RECENTLY VIEWED
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              Continue Shopping
            </h2>
          </div>

          {recentlyViewed.length > 6 && (
            <button
              onClick={handleViewAll}
              className="hidden sm:inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
            >
              View All
              <FiArrowRight className="text-sm" />
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
          {recentlyViewed.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => handleProductClick(item.product.id)}
              className="group bg-white rounded-lg md:rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {getProductImage(item.product) ? (
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gray-200 items-center justify-center"
                  style={{
                    display: getProductImage(item.product) ? "none" : "flex",
                  }}
                >
                  <FiEye className="text-gray-400 text-xl" />
                </div>

                {/* Overlay with actions - visible on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <FiEye className="text-gray-700 text-sm" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <FiShoppingCart className="text-gray-700 text-sm" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <FiHeart className="text-gray-700 text-sm" />
                  </button>
                </div>

                {/* Recently viewed badge */}
                <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                  <FiClock className="inline mr-1 text-xs" />
                  Recent
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-4">
                <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {item.product.title}
                </h3>

                {/* Category */}
                {item.product.category && (
                  <p className="text-xs text-gray-500 mb-2">
                    {item.product.category.name}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold text-sm md:text-base">
                    $
                    {parseFloat(
                      item.product.sale_price || item.product.price
                    ).toFixed(2)}
                  </span>
                  {item.product.discount_percentage > 0 &&
                    item.product.compare_at_price && (
                      <>
                        <span className="text-gray-400 line-through text-xs">
                          $
                          {parseFloat(item.product.compare_at_price).toFixed(2)}
                        </span>
                        <span className="text-xs text-red-600 font-medium">
                          {item.product.discount_percentage}% OFF
                        </span>
                      </>
                    )}
                </div>

                {/* Viewed time */}
                <p className="text-xs text-gray-400 mt-2">
                  Viewed {new Date(item.viewed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        {recentlyViewed.length > 6 && (
          <div className="text-center mt-6 sm:hidden">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              View All ({recentlyViewed.length})
              <FiArrowRight className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentlyViewed;
