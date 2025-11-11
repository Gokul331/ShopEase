import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { 
  FiTrendingUp, 
  FiShoppingBag, 
  FiZap, 
  FiStar,
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiArrowRight,
  FiRefreshCw
} from "react-icons/fi";

const placeholderImage = (seed, w = 400, h = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const ProductCard = ({ product, section }) => {
  const { addToCart, addToWishlist, cartItems, wishlistProducts } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Check if product is already in cart or wishlist
  const isInCart = cartItems?.some(item => item.product?.id === product.id);
  const isInWishlist = wishlistProducts?.some(item => item.id === product.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    if (isInCart) {
      navigate("/cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product.id);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    if (isInWishlist) {
      navigate("/wishlist");
      return;
    }

    setIsAddingToWishlist(true);
    try {
      await addToWishlist(product.id);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  const getSectionIcon = () => {
    switch (section) {
      case "trends": return <FiTrendingUp className="text-white" size={14} />;
      case "mostBought": return <FiShoppingBag className="text-white" size={14} />;
      case "hotPicks": return <FiZap className="text-white" size={14} />;
      default: return <FiStar className="text-white" size={14} />;
    }
  };

  

  const getSectionBadgeColor = () => {
    switch (section) {
      case "trends": return "bg-blue-500 text-white";
      case "mostBought": return "bg-green-500 text-white";
      case "hotPicks": return "bg-orange-500 text-white";
      default: return "bg-purple-500 text-white";
    }
  };

  return (
    <div
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl cursor-pointer flex-shrink-0 w-64 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={product.image || placeholderImage(product.slug || product.id)}
          alt={product.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = placeholderImage(product.slug || product.id);
          }}
        />
        
        {/* Section Badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getSectionBadgeColor()}`}>
          {getSectionIcon()}
          <span className="capitalize">
            {section === "mostBought" ? "Popular" : 
             section === "hotPicks" ? "Hot" : 
             section === "trends" ? "Trending" : section}
          </span>
        </div>

        {/* Quick Actions Overlay */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}>
          <button
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors p-0 ${
              isInWishlist 
                ? "bg-red-500 text-white" 
                : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
            title={isInWishlist ? "View in Wishlist" : "Add to Wishlist"}
          >
            {isAddingToWishlist ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiHeart size={20} className={isInWishlist ? "fill-current" : ""} />
            )}
          </button>
          
        </div>

        {/* Add to Cart Button Overlay */}
        <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 font-semibold text-sm ${
              isInCart
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-white text-gray-700 hover:bg-indigo-600 hover:text-white"
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : isInCart ? (
              <>
                <FiShoppingCart size={14} />
                View Cart
              </>
            ) : (
              <>
                <FiShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
          {product.title}
        </h3>
        
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            {typeof product.category === 'object' ? product.category.name : product.category}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            ${parseFloat(product.price || 0).toFixed(2)}
          </span>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FiStar className="text-yellow-400 fill-current" size={14} />
              <span>{parseFloat(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Stock:</span>
              <span className={product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-600" : "text-red-600"}>
                {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
              </span>
            </div>
            {product.stock > 0 && product.stock <= 10 && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-orange-500 h-1 rounded-full" 
                  style={{ width: `${(product.stock / 10) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

const Section = ({ title, products, section, icon, loading }) => {
  const navigate = useNavigate();

  if ((!products || products.length === 0) && !loading) return null;

  return (
    <div className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm">
              {loading ? "Loading..." : `${products.length} amazing products`}
            </p>
          </div>
        </div>
        
        {!loading && products.length > 0 && (
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group"
          >
            View All
            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        )}
      </div>

      {/* Products Scroll */}
      <div className="relative">
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-64 flex-shrink-0 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-2xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  section={section}
                />
              ))}
            </div>
            
            {/* Gradient Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
};

const Subcategories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productAPI.list();
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Unable to load products. Please check your connection.");
      setProducts([]); // Reset products on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Enhanced product sorting with fallbacks
  const newest = [...products]
    .sort((a, b) => new Date(b.created_at || b.dateAdded || 0) - new Date(a.created_at || a.dateAdded || 0))
    .slice(0, 8);

  const mostBought = [...products]
    .sort((a, b) => (b.purchase_count || b.orders || 0) - (a.purchase_count || a.orders || 0))
    .slice(0, 8);

  const hotPicks = [...products]
    .filter(product => (product.rating || 0) >= 3.8)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  if (error && products.length === 0) {
    return (
      <section id="subcategories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiZap className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Products</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
          >
            <FiRefreshCw size={18} />
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="subcategories" className="py-4 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FiZap className="text-lg" />
            CURATED COLLECTIONS
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Handpicked For You
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover carefully selected products across different categories. 
            Find your next favorite item!
          </p>
        </div>

        {/* Sections */}
        <Section 
          title="Latest Trends" 
          products={newest} 
          section="trends"
          icon={<FiTrendingUp className="text-white text-lg" />}
          loading={loading}
        />
        
        <Section 
          title="Most Popular" 
          products={mostBought} 
          section="mostBought"
          icon={<FiShoppingBag className="text-white text-lg" />}
          loading={loading}
        />
        
        <Section 
          title="Hot Picks" 
          products={hotPicks} 
          section="hotPicks"
          icon={<FiZap className="text-white text-lg" />}
          loading={loading}
        />

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Available</h3>
            <p className="text-gray-600 mb-6">Check back later for new products!</p>
          </div>
        )}
      </div>

      {/* Custom CSS for scrollbar hiding */}
      <style jsx = {true}>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default Subcategories;