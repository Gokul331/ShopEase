import React from "react";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowLeft,
  FiEye,
  FiShare2,
} from "react-icons/fi";

const Wishlist = () => {
  const { wishlist, wishlistProducts, removeFromWishlist, addToCart } =
    useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const items = wishlistProducts || [];

  const handleAddToCart = async (productId, productTitle) => {
    if (!user) {
      alert("Please log in to add items to cart");
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }

    try {
      await addToCart(productId);
      // Optional: Show success message or notification
      alert(`"${productTitle}" added to cart!`);
    } catch (error) {
      alert("Failed to add item to cart");
      console.error("Add to cart error:", error);
    }
  };

  const handleRemoveFromWishlist = (productId, productTitle) => {
    if (window.confirm(`Remove "${productTitle}" from wishlist?`)) {
      removeFromWishlist(productId);
    }
  };

  const handleQuickView = (product) => {
    // Implement quick view functionality
    console.log("Quick view:", product);
    // You could open a modal or navigate to product page
    navigate(`/products/${product.id}`);
  };

  const handleShareProduct = async (product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on ShopEase!`,
          url: `${window.location.origin}/products/${product.id}`,
        });
      } catch (error) {
        console.log("Sharing cancelled", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/products/${product.id}`
      );
      alert("Product link copied to clipboard!");
    }
  };

  const continueShopping = () => {
    navigate("/products");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="text-pink-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view and manage your wishlist.
          </p>
          <button
            onClick={() => navigate("/login", { state: { from: "/wishlist" } })}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="text-pink-500 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. Review them anytime and
              easily move them to your cart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={continueShopping}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiArrowLeft className="text-lg" />
                Continue Shopping
              </button>
              <Link
                to="/trending"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiHeart className="text-lg" />
                View Trending Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={continueShopping}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Continue Shopping
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiHeart className="text-gray-400 text-2xl" />
                  </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleQuickView(item)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Quick View"
                  >
                    <FiEye className="text-gray-600 text-sm" />
                  </button>
                  <button
                    onClick={() => handleShareProduct(item)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Share"
                  >
                    <FiShare2 className="text-gray-600 text-sm" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id, item.title)}
                  className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="text-gray-600 text-sm" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-lg font-bold text-indigo-600 mb-3">
                  ${parseFloat(item.price || 0).toFixed(2)}
                </p>

                {/* Product Details */}
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  {item.category && (
                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                      {typeof item.category === "object"
                        ? item.category.name ||
                          item.category.title ||
                          item.category.slug ||
                          JSON.stringify(item.category)
                        : item.category}
                    </p>
                  )}
                  {item.in_stock !== undefined && (
                    <p
                      className={
                        item.in_stock ? "text-green-600" : "text-red-600"
                      }
                    >
                      {item.in_stock ? "In Stock" : "Out of Stock"}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.id, item.title)}
                    disabled={!item.in_stock}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <FiShoppingCart className="text-sm" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wishlist Summary */}
        {items.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-gray-600">
                  You have{" "}
                  <span className="font-semibold text-gray-900">
                    {items.length} items
                  </span>{" "}
                  in your wishlist
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Total value: $
                  {items
                    .reduce(
                      (total, item) => total + parseFloat(item.price || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (window.confirm("Remove all items from wishlist?")) {
                      items.forEach((item) => removeFromWishlist(item.id));
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={continueShopping}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Find More Items
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
