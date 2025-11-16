import React, { useCallback, memo, useState, useEffect } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { getProductImage, getProductImages } from "../utils/imageUtils";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowLeft,
  FiEye,
  FiShare2,
  FiX,
  FiPlus,
  FiMinus,
  FiStar,
} from "react-icons/fi";

// Quick View Modal Component
const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  addingToCart,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const images = getProductImages(product);
  const hasMultipleImages = images.length > 1;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product.id, product.title, quantity);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                {images[selectedImage] && !imageError ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiHeart className="text-gray-400 text-4xl" />
                  </div>
                )}
              </div>

              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(index);
                        setImageError(false);
                      }}
                      className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-indigo-600"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <div className="flex items-center gap-4 mb-3">
                  <p className="text-3xl font-bold text-indigo-600">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </p>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-lg text-gray-500 line-through">
                        ${parseFloat(product.originalPrice).toFixed(2)}
                      </p>
                    )}
                </div>

                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`${
                            star <= (product.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          } text-sm`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Features */}
              <div className="space-y-3">
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Category:</span>
                    <span className="text-gray-600">
                      {typeof product.category === "object"
                        ? product.category.name || product.category.title
                        : product.category}
                    </span>
                  </div>
                )}

                {product.in_stock !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      Availability:
                    </span>
                    <span
                      className={
                        product.in_stock ? "text-green-600" : "text-red-600"
                      }
                    >
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                )}

                {product.shipping && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Shipping:</span>
                    <span className="text-gray-600">{product.shipping}</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiMinus className="text-sm" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart === product.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {addingToCart === product.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="text-lg" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiHeart className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Share Modal Component
const ShareModal = ({ product, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const productUrl = `${window.location.origin}/products/${product?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on ShopEase!`,
          url: productUrl,
        });
        onClose();
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log("Sharing error", error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Share Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {getProductImage(product) ? (
                <img
                  src={getProductImage(product)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center ${
                  getProductImage(product) ? "hidden" : "flex"
                }`}
              >
                <FiHeart className="text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {product.title}
              </h3>
              <p className="text-lg font-bold text-indigo-600">
                ${parseFloat(product.price || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <FiShare2 className="text-lg" />
              Share via...
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <FiX className="text-white text-xs rotate-45" />
                  </div>
                  Link Copied!
                </>
              ) : (
                <>
                  <FiShare2 className="text-lg" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full animate-scaleIn">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized Wishlist Item Component (Updated with modal triggers)
const WishlistItem = memo(
  ({ item, onAddToCart, onRemove, onQuickView, onShare, addingToCart }) => {
    const [imageError, setImageError] = useState(false);

    const handleAddToCart = useCallback(() => {
      onAddToCart(item.id, item.title, 1);
    }, [item.id, item.title, onAddToCart]);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {getProductImage(item) && !imageError ? (
            <img
              src={getProductImage(item)}
              alt={item.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <FiHeart className="text-gray-400 text-2xl" />
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200">
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onQuickView(item)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                aria-label={`Quick view ${item.title}`}
                title="Quick View"
              >
                <FiEye className="text-gray-600 text-sm" />
              </button>
              <button
                onClick={() => onShare(item)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                aria-label={`Share ${item.title}`}
                title="Share"
              >
                <FiShare2 className="text-gray-600 text-sm" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id, item.title)}
              className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Remove ${item.title} from wishlist`}
              title="Remove from wishlist"
            >
              <FiTrash2 className="text-gray-600 text-sm" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3
            className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 cursor-pointer"
            onClick={() => onQuickView(item)}
          >
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
              <p className={item.in_stock ? "text-green-600" : "text-red-600"}>
                {item.in_stock ? "In Stock" : "Out of Stock"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!item.in_stock || addingToCart === item.id}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              aria-label={`Add ${item.title} to cart`}
            >
              {addingToCart === item.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiShoppingCart className="text-sm" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// Toast Hook
const useToast = () => {
  const showToast = useCallback((message, type = "info") => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300 ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500"
    }`;
    toast.textContent = message;

    // Add icon based on type
    const icon = document.createElement("span");
    icon.className = "mr-2";
    icon.textContent =
      type === "success"
        ? "✅"
        : type === "error"
        ? "❌"
        : type === "warning"
        ? "⚠️"
        : "ℹ️";
    toast.prepend(icon);

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    // Remove after delay
    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }, []);

  return { showToast };
};

// Loading and other components remain the same as previous implementation
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading your wishlist...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiTrash2 className="text-red-500 text-3xl" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-2">Error loading wishlist:</p>
      <p className="text-red-600 mb-6 text-sm">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const EmptyWishlist = ({ onContinueShopping }) => (
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
          Save items you love to your wishlist. Review them anytime and easily
          move them to your cart.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onContinueShopping}
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

const AuthRequired = ({ onNavigateToLogin }) => (
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
        onClick={onNavigateToLogin}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Sign In
      </button>
    </div>
  </div>
);

// Main Wishlist Component
const Wishlist = () => {
  const {
    wishlist,
    wishlistProducts,
    removeFromWishlist,
    addToCart,
    loading = false,
    error = null,
    recommendedProducts = [],
  } = useStore();

  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [addingToCart, setAddingToCart] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Modal states
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    productId: null,
    productTitle: null,
  });

  const items = wishlistProducts || [];

  // Memoized handlers
  const handleAddToCart = useCallback(
    async (productId, productTitle, quantity = 1) => {
      if (!user) {
        showToast("Please log in to add items to cart", "warning");
        navigate("/login", { state: { from: "/wishlist" } });
        return;
      }

      setAddingToCart(productId);
      setLocalError(null);

      try {
        // Add item to cart with quantity
        for (let i = 0; i < quantity; i++) {
          await addToCart(productId);
        }
        showToast(`"${productTitle}" added to cart!`, "success");
      } catch (error) {
        const errorMessage = error?.message || "Failed to add item to cart";
        showToast(errorMessage, "error");
        setLocalError(errorMessage);
        console.error("Add to cart error:", error);
      } finally {
        setAddingToCart(null);
      }
    },
    [user, navigate, addToCart, showToast]
  );

  const handleRemoveFromWishlist = useCallback((productId, productTitle) => {
    setConfirmationModal({
      isOpen: true,
      productId,
      productTitle,
    });
  }, []);

  const confirmRemoveFromWishlist = useCallback(() => {
    const { productId, productTitle } = confirmationModal;
    try {
      removeFromWishlist(productId);
      showToast(`"${productTitle}" removed from wishlist`, "success");
      setConfirmationModal({
        isOpen: false,
        productId: null,
        productTitle: null,
      });
    } catch (error) {
      showToast("Failed to remove item from wishlist", "error");
      console.error("Remove from wishlist error:", error);
    }
  }, [confirmationModal, removeFromWishlist, showToast]);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
  }, []);

  const handleShareProduct = useCallback((product) => {
    setShareProduct(product);
  }, []);

  const continueShopping = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleNavigateToLogin = useCallback(() => {
    navigate("/login", { state: { from: "/wishlist" } });
  }, [navigate]);

  const handleClearAll = useCallback(() => {
    setConfirmationModal({
      isOpen: true,
      productId: "all",
      productTitle: "all items",
    });
  }, []);

  const confirmClearAll = useCallback(() => {
    try {
      items.forEach((item) => removeFromWishlist(item.id));
      showToast("All items removed from wishlist", "success");
      setConfirmationModal({
        isOpen: false,
        productId: null,
        productTitle: null,
      });
    } catch (error) {
      showToast("Failed to clear wishlist", "error");
      console.error("Clear wishlist error:", error);
    }
  }, [items, removeFromWishlist, showToast]);

  const handleConfirmation = useCallback(() => {
    if (confirmationModal.productId === "all") {
      confirmClearAll();
    } else {
      confirmRemoveFromWishlist();
    }
  }, [confirmationModal, confirmClearAll, confirmRemoveFromWishlist]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error || localError) {
    return <ErrorState error={error || localError} onRetry={handleRetry} />;
  }

  // Authentication check
  if (!user) {
    return <AuthRequired onNavigateToLogin={handleNavigateToLogin} />;
  }

  // Empty state
  if (items.length === 0) {
    return <EmptyWishlist onContinueShopping={continueShopping} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <>
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors flex-shrink-0 sm:hidden"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="text-xl" />
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    My Wishlist
                  </h1>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium hidden sm:block">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <button
                onClick={continueShopping}
                className="hidden sm:block text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Continue Shopping
              </button>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between sm:hidden z-40">
              <div className="flex items-center gap-2">
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={continueShopping}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                <FiArrowLeft className="text-sm" />
                Continue
              </button>
            </div>

            {/* Add padding to bottom for mobile to account for fixed bar */}
            <div className="pb-20 sm:pb-0"></div>
          </>

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onRemove={handleRemoveFromWishlist}
                onQuickView={handleQuickView}
                onShare={handleShareProduct}
                addingToCart={addingToCart}
              />
            ))}
          </div>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                You might also like
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleQuickView(product)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center ${
                          getProductImage(product) ? "hidden" : "flex"
                        }`}
                      >
                        <FiHeart className="text-gray-400" />
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                      {product.title}
                    </h4>
                    <p className="text-indigo-600 font-bold">
                      ${parseFloat(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wishlist Summary */}
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
                  onClick={handleClearAll}
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
        </div>
      </div>

      {/* Modals */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        addingToCart={addingToCart}
      />

      <ShareModal
        product={shareProduct}
        isOpen={!!shareProduct}
        onClose={() => setShareProduct(null)}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({
            isOpen: false,
            productId: null,
            productTitle: null,
          })
        }
        onConfirm={handleConfirmation}
        title={
          confirmationModal.productId === "all"
            ? "Clear Wishlist"
            : "Remove Item"
        }
        message={
          confirmationModal.productId === "all"
            ? "Are you sure you want to remove all items from your wishlist?"
            : `Are you sure you want to remove "${confirmationModal.productTitle}" from your wishlist?`
        }
      />
    </>
  );
};

export default Wishlist;
