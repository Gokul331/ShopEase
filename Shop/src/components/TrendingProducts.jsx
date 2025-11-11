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
  FiChevronRight
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
            .slice(0, 6);
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

  const isInCart = (productId) => {
    return cart?.items?.some((item) => item?.product?.id === productId) || false;
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
      <section className="se-trending py-8 md:py-12 bg-gray-50">
        <div className="se-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Trending Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading trending products...
            </p>
          </div>
          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
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
      <section className="se-trending py-8 md:py-12 bg-gray-50">
        <div className="se-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Products
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="se-trending py-8 md:py-12 bg-gray-50">
      <div className="se-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FiTrendingUp className="text-lg" />
            TRENDING NOW
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hot Products This Week
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover the most popular products everyone's talking about
          </p>
        </div>

        {/* Products Grid */}
        <div className="products-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const discount = product.discount_percentage || discountFor(product);
            const rating = calculateRating(product);
            const isCartLoading = addingToCart[product.id];
            const isWishlistLoading = addingToWishlist[product.id];
            const inCart = isInCart(product.id);
            const inWishlist = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                className="product-card group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image || placeholderImage(product.slug || product.id, 300, 200)}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {discount}% OFF
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={() => handleQuickView(product)}
                      className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Quick View"
                    >
                      <FiEye className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleAddToWishlist(product)}
                      disabled={isWishlistLoading}
                      className={`w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 ${
                        inWishlist
                          ? "text-red-500 hover:bg-red-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
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
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                      {product.category.name}
                    </p>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 h-14">
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
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isCartLoading || inCart}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
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
              className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <FiZap className="text-lg" />
              View All Products
              <FiChevronRight className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;