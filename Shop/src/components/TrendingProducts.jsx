import React, { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { productAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiStar,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

const placeholderImage = (seed, w = 400, h = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const TrendingProducts = () => {
  const { addToCart, addToWishlist, removeFromWishlist, cart, wishlist } =
    useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [addingToWishlist, setAddingToWishlist] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productAPI.list();
        if (mounted) {
          const trendingProducts = (res.data || [])
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 9);
          setProducts(trendingProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load trending products");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => (mounted = false);
  }, []);

  const discountFor = (p) => {
    const id = p.id || 0;
    return 10 + (id % 30);
  };

  // Safe check functions with proper null/undefined handling
  const isInCart = (productId) => {
    return (
      cart?.items?.some((item) => item?.product?.id === productId) || false
    );
  };

  const isInWishlist = (productId) => {
    return wishlist?.products?.some((item) => item?.id === productId) || false;
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
    try {
      await addToCart(product.id);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    setAddingToWishlist((prev) => ({ ...prev, [product.id]: true }));
    try {
      const inWishlist = isInWishlist(product.id);
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    } finally {
      setAddingToWishlist((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleQuickView = (product) => {
    navigate(`/products/${product.id}`);
  };

  const calculateRating = (product) => {
    return product.rating || Math.random() * 2 + 3;
  };

  if (loading) {
    return (
      <section id="trending" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="text-gray-600 text-2xl" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trending Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the most popular products everyone's talking about
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="trending" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiZap className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Products
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="trending"
      className=""
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FiTrendingUp className="text-lg" />
            TRENDING NOW
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hot Products This Week
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular products everyone's talking about. Limited
            stock available!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const discount =
              product.discount_percentage || discountFor(product);
            const rating = calculateRating(product);
            const isCartLoading = addingToCart[product.id];
            const isWishlistLoading = addingToWishlist[product.id];
            const inCart = isInCart(product.id);
            const inWishlist = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={
                      product.image ||
                      placeholderImage(product.slug || product.id)
                    }
                    alt={product.title}
                    className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {discount}% OFF
                    </div>
                  )}

                  {/* Quick Actions Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleQuickView(product)}
                      className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                      title="Quick View"
                    >
                      <FiEye className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleAddToWishlist(product)}
                      disabled={isWishlistLoading}
                      className={`w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
                        inWishlist
                          ? "text-red-500 hover:bg-red-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title={
                        inWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                      }
                    >
                      {isWishlistLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      ) : (
                        <FiHeart className={inWishlist ? "fill-current" : ""} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Category */}
                  {product.category && (
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
                      {product.category.name}
                    </p>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({Math.round(rating * 10) / 10})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {discount > 0 && (
                      <span className="text-lg text-gray-500 line-through">
                        $
                        {(
                          parseFloat(product.price) *
                          (1 + discount / 100)
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isCartLoading || inCart}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        inCart
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
                      } ${
                        isCartLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isCartLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : inCart ? (
                        <>
                          <FiShoppingCart />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <FiShoppingCart />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:shadow-lg"
            >
              <FiZap className="text-lg" />
              View All Products
              <FiTrendingUp className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;
