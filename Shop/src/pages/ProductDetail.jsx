import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { productAPI, recentlyViewedAPI } from "../services/api";
import {
  FiShoppingCart,
  FiHeart,
  FiChevronLeft,
  FiShare2,
  FiStar,
  FiPackage,
  FiTruck,
  FiRefreshCw,
} from "react-icons/fi";

const placeholderImage = (seed, w = 600, h = 400) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, cart, wishlist } =
    useStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug information
        console.log("Fetching product with ID:", productId);
        console.log(
          "Current auth token:",
          localStorage.getItem("access_token")
        );

        const response = await productAPI.retrieve(productId);
        console.log("Product API response:", response);

        if (!response.data) {
          throw new Error("No data received from the server");
        }

        setProduct(response.data);
        console.log("Product data set:", response.data);

        // Fetch related products (same category)
        if (response.data.category) {
          console.log(
            "Fetching related products for category:",
            response.data.category.id
          );

          const relatedResponse = await productAPI.list();
          console.log("Related products response:", relatedResponse);

          if (relatedResponse?.data) {
            const filtered = relatedResponse.data
              .filter(
                (p) =>
                  p.category?.id === response.data.category.id &&
                  p.id !== response.data.id
              )
              .sort(() => Math.random() - 0.5) // Shuffle
              .slice(0, 4); // Take up to 4 related products

            console.log("Filtered related products:", filtered);
            setRelatedProducts(filtered);
          }
        }

        // record recently viewed (if authenticated)
        try {
          if (user) {
            await recentlyViewedAPI.create({ product_id: response.data.id });
            const rv = await recentlyViewedAPI.list();
            setRecentlyViewed(rv.data || []);
          }
        } catch (rvErr) {
          console.debug(
            "Could not record recently viewed:",
            rvErr?.response?.data || rvErr.message
          );
        }
      } catch (err) {
        console.error("Error fetching product:", err);

        if (err.response) {
          // Server responded with an error
          console.error("Server error response:", {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
          });
          setError(
            `Server error: ${err.response.status} - ${
              err.response.data?.detail || err.response.statusText
            }`
          );
        } else if (err.request) {
          // Request was made but no response received
          console.error("No response received:", err.request);
          setError("Could not reach the server. Please check your connection.");
        } else {
          // Error before making the request
          console.error("Error details:", err.message);
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  useEffect(() => {
    // Fetch recently viewed for the current user when available
    const fetchRecently = async () => {
      if (user) {
        try {
          const rv = await recentlyViewedAPI.list();
          setRecentlyViewed(rv.data || []);
        } catch (e) {
          // ignore quietly
        }
      }
    };

    fetchRecently();
  }, [user]);

  const isInCart = (productId) => {
    return (
      cart?.items?.some((item) => item?.product?.id === productId) || false
    );
  };

  const isInWishlist = (productId) => {
    return wishlist?.products?.some((item) => item?.id === productId) || false;
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${productId}` } });
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(productId, quantity);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${productId}` } });
      return;
    }

    setAddingToWishlist(true);
    try {
      const inWishlist = isInWishlist(productId);
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Error Loading Product
            </h2>
            <p className="text-red-600 mb-4">{error || "Product not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <FiChevronLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FiChevronLeft className="mr-1" /> Back
          </button>
          <span className="mx-2 text-gray-400">/</span>
          {product.category && (
            <>
              <span className="text-gray-600">{product.category.name}</span>
              <span className="mx-2 text-gray-400">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <img
              src={
                product.image || placeholderImage(product.slug || product.id)
              }
              alt={product.title}
              className="w-full h-auto rounded-2xl shadow-lg"
            />
            {product.discount_percentage > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                {product.discount_percentage}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            {/* Category & Rating */}
            <div className="flex items-center gap-4 mb-6">
              {product.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {product.category.name}
                </span>
              )}
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={
                      i < Math.floor(product.rating || 4)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  ({Math.round((product.rating || 4) * 10) / 10})
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8">
              {product.description || "No description available."}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-bold text-indigo-600">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.discount_percentage > 0 && (
                <span className="text-2xl text-gray-400 line-through">
                  $
                  {(
                    parseFloat(product.price) *
                    (1 + product.discount_percentage / 100)
                  ).toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-8">
              <label className="text-gray-700 font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 text-gray-600 hover:text-indigo-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isInCart(product.id)}
                className={`flex-1 inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white transition-colors ${
                  isInCart(product.id)
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : isInCart(product.id) ? (
                  <>
                    <FiShoppingCart className="mr-2" />
                    In Cart
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="mr-2" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={addingToWishlist}
                className={`inline-flex items-center justify-center p-4 rounded-xl border ${
                  isInWishlist(product.id)
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {addingToWishlist ? (
                  <div className="w-5 h-5 border-t-2 border-gray-600 border-solid rounded-full animate-spin"></div>
                ) : (
                  <FiHeart
                    className={isInWishlist(product.id) ? "fill-current" : ""}
                  />
                )}
              </button>

              <button className="inline-flex items-center justify-center p-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50">
                <FiShare2 />
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <FiPackage className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Free Delivery</h4>
                    <p className="text-sm text-gray-500">Orders over $50</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <FiTruck className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Fast Shipping</h4>
                    <p className="text-sm text-gray-500">2-3 business days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <FiRefreshCw className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Easy Returns</h4>
                    <p className="text-sm text-gray-500">30 day returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <img
                    src={
                      relatedProduct.image ||
                      placeholderImage(relatedProduct.slug || relatedProduct.id)
                    }
                    alt={relatedProduct.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-bold">
                        ${parseFloat(relatedProduct.price).toFixed(2)}
                      </span>
                      {relatedProduct.discount_percentage > 0 && (
                        <span className="text-sm text-red-600 font-medium">
                          {relatedProduct.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.map((rv) => (
                <div
                  key={rv.id}
                  onClick={() => navigate(`/products/${rv.product.id}`)}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <img
                    src={
                      rv.product.image ||
                      placeholderImage(rv.product.slug || rv.product.id)
                    }
                    alt={rv.product.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {rv.product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-bold">
                        ${parseFloat(rv.product.price).toFixed(2)}
                      </span>
                      {rv.product.discount_percentage > 0 && (
                        <span className="text-sm text-red-600 font-medium">
                          {rv.product.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
