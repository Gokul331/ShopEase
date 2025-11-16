import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { productAPI, recentlyViewedAPI } from "../services/api";
import { getProductImage, getProductImages } from "../utils/imageUtils";
import {
  FiShoppingCart,
  FiHeart,
  FiChevronLeft,
  FiShare2,
  FiStar,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiArrowLeft,
  FiBox,
  FiGlobe,
  FiShield,
  FiTag,
  FiLayers,
} from "react-icons/fi";

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
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productAPI.retrieve(productId);

        if (!response.data) {
          throw new Error("No data received from the server");
        }

        setProduct(response.data);

        // Fetch related products (same category)
        if (response.data.category) {
          const relatedResponse = await productAPI.list();
          if (relatedResponse?.data) {
            const filtered = relatedResponse.data
              .filter(
                (p) =>
                  p.category?.id === response.data.category.id &&
                  p.id !== response.data.id
              )
              .sort(() => Math.random() - 0.5)
              .slice(0, 4);
            setRelatedProducts(filtered);
          }
        }

        // Record recently viewed (if authenticated)
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
          setError(
            `Server error: ${err.response.status} - ${
              err.response.data?.detail || err.response.statusText
            }`
          );
        } else if (err.request) {
          setError("Could not reach the server. Please check your connection.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId, user]);

  useEffect(() => {
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

  // Helper function to get specifications array
  const getSpecifications = () => {
    const specs = [];
    for (let i = 1; i <= 5; i++) {
      const spec = product[`specification_${i}`];
      if (spec && spec.trim()) {
        specs.push(spec);
      }
    }
    return specs;
  };

  // Helper function to get product attributes
  const getProductAttributes = () => {
    const attributes = [];
    if (product.color)
      attributes.push({ label: "Color", value: product.color });
    if (product.material)
      attributes.push({ label: "Material", value: product.material });
    if (product.size) attributes.push({ label: "Size", value: product.size });
    if (product.style)
      attributes.push({ label: "Style", value: product.style });
    return attributes;
  };

  // Helper function to get physical specifications
  const getPhysicalSpecs = () => {
    const specs = [];
    if (product.weight)
      specs.push({
        label: "Weight",
        value: `${product.weight} ${product.weight_unit || "kg"}`,
      });
    if (product.dimensions)
      specs.push({ label: "Dimensions", value: product.dimensions });
    if (product.length && product.width && product.height) {
      specs.push({
        label: "Dimensions",
        value: `${product.length} × ${product.width} × ${product.height} ${
          product.dimensions_unit || "cm"
        }`,
      });
    }
    return specs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
              <div className="h-60 sm:h-72 lg:h-80 bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-4">
                Error Loading Product
              </h2>
              <p className="text-red-600 mb-6 text-sm sm:text-base">
                {error || "Product not found"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <FiArrowLeft className="mr-2" /> Go Back
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Browse Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create image array for gallery
  const productImages = getProductImages(product);

  const specifications = getSpecifications();
  const attributes = getProductAttributes();
  const physicalSpecs = getPhysicalSpecs();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors text-sm"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {/* Desktop Breadcrumb */}
        <nav className="hidden lg:flex items-center mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors text-sm"
          >
            <FiChevronLeft className="mr-1" /> Back
          </button>
          <span className="mx-2 text-gray-400">/</span>
          {product.category && (
            <>
              <span className="text-gray-600 text-sm">
                {product.category.name}
              </span>
              <span className="mx-2 text-gray-400">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium text-sm truncate">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
              <img
                src={productImages[activeImage]}
                alt={product.title}
                className="w-full h-48 sm:h-60 lg:h-72 object-cover"
              />
              {/* Product Status Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.discount_percentage > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-bold">
                    {product.discount_percentage}% OFF
                  </div>
                )}
                {product.is_new_arrival && (
                  <div className="bg-green-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-bold">
                    NEW
                  </div>
                )}
                {product.is_featured && (
                  <div className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-bold">
                    FEATURED
                  </div>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === index
                        ? "border-indigo-600"
                        : "border-gray-200 hover:border-gray-300"
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {product.title}
              </h1>

              {/* Product Identifiers */}
              <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-500">
                {product.sku && <span>SKU: {product.sku}</span>}
                {product.upc && <span>UPC: {product.upc}</span>}
                {product.model_number && (
                  <span>Model: {product.model_number}</span>
                )}
              </div>

              {/* Category & Brand */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.category && (
                  <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category.name}
                  </span>
                )}
                {product.brand && (
                  <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.brand.name}
                  </span>
                )}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating || 4)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({Math.round((product.rating || 4) * 10) / 10})
                  </span>
                </div>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-indigo-600">
                ${parseFloat(product.sale_price || product.price).toFixed(2)}
              </span>
              {product.discount_percentage > 0 && product.compare_at_price && (
                <span className="text-xl sm:text-2xl text-gray-400 line-through">
                  ${parseFloat(product.compare_at_price).toFixed(2)}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span className="text-sm text-red-600 font-medium">
                  Save ${parseFloat(product.discount_amount || 0).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center">
              <span
                className={`text-sm font-medium ${
                  product.stock_status === "In Stock"
                    ? "text-green-600"
                    : product.stock_status === "Low Stock"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {product.stock_status ||
                  (product.in_stock ? "In Stock" : "Out of Stock")}
              </span>
              {product.stock_status === "Low Stock" && product.stock && (
                <span className="ml-2 text-xs text-gray-500">
                  (Only {product.stock} left)
                </span>
              )}
              {product.manage_stock &&
                product.stock &&
                product.stock_status === "In Stock" && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({product.stock} available)
                  </span>
                )}
            </div>

            {/* Product Attributes */}
            {attributes.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">
                      {attr.label}:
                    </span>
                    <span className="text-sm text-gray-900">{attr.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium text-sm sm:text-base">
                Quantity:
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 sm:px-4 py-2 font-medium text-sm sm:text-base min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  disabled={product.manage_stock && quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  addingToCart || isInCart(product.id) || !product.in_stock
                }
                className={`flex-1 inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border border-transparent text-base font-medium rounded-xl shadow-sm text-white transition-colors ${
                  isInCart(product.id)
                    ? "bg-green-600 cursor-not-allowed"
                    : !product.in_stock
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : isInCart(product.id) ? (
                  <>
                    <FiShoppingCart className="mr-2" size={18} />
                    In Cart
                  </>
                ) : !product.in_stock ? (
                  "Out of Stock"
                ) : (
                  <>
                    <FiShoppingCart className="mr-2" size={18} />
                    Add to Cart
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleWishlistToggle}
                  disabled={addingToWishlist}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center p-3 sm:p-4 rounded-xl border transition-colors ${
                    isInWishlist(product.id)
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {addingToWishlist ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-gray-600 border-solid rounded-full animate-spin"></div>
                  ) : (
                    <FiHeart
                      size={18}
                      className={isInWishlist(product.id) ? "fill-current" : ""}
                    />
                  )}
                </button>

                <button className="flex-1 sm:flex-none inline-flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiShare2 size={18} />
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                    <FiPackage className="text-indigo-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Free Delivery
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Orders over $50
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                    <FiTruck className="text-indigo-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Fast Shipping
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      2-3 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                    <FiRefreshCw className="text-indigo-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Easy Returns
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      30 day returns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12 bg-white rounded-xl shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 sm:flex-none px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "description"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Description
              </button>
              {specifications.length > 0 && (
                <button
                  onClick={() => setActiveTab("specifications")}
                  className={`flex-1 sm:flex-none px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "specifications"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Specifications
                </button>
              )}
              {(physicalSpecs.length > 0 ||
                product.country_of_origin ||
                product.warranty_period) && (
                <button
                  onClick={() => setActiveTab("details")}
                  className={`flex-1 sm:flex-none px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "details"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Details
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && specifications.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-start py-2 border-b border-gray-100"
                  >
                    <FiLayers
                      className="text-indigo-600 mt-1 mr-3 flex-shrink-0"
                      size={16}
                    />
                    <div>
                      <p className="text-gray-900 text-sm">{spec}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Specifications */}
                {physicalSpecs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiBox className="mr-2 text-indigo-600" />
                      Physical Specifications
                    </h4>
                    <div className="space-y-2">
                      {physicalSpecs.map((spec, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            {spec.label}:
                          </span>
                          <span className="text-gray-900 text-sm font-medium">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warranty & Origin */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FiShield className="mr-2 text-indigo-600" />
                    Warranty & Origin
                  </h4>
                  <div className="space-y-2">
                    {product.warranty_period && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Warranty:</span>
                        <span className="text-gray-900 text-sm font-medium">
                          {product.warranty_period}
                        </span>
                      </div>
                    )}
                    {product.warranty_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          Warranty Type:
                        </span>
                        <span className="text-gray-900 text-sm font-medium">
                          {product.warranty_type}
                        </span>
                      </div>
                    )}
                    {product.country_of_origin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          Country of Origin:
                        </span>
                        <span className="text-gray-900 text-sm font-medium">
                          {product.country_of_origin}
                        </span>
                      </div>
                    )}
                    {product.hs_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">HS Code:</span>
                        <span className="text-gray-900 text-sm font-medium">
                          {product.hs_code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 lg:mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {getProductImage(relatedProduct) ? (
                    <img
                      src={getProductImage(relatedProduct)}
                      alt={relatedProduct.title}
                      className="w-full h-28 sm:h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-28 sm:h-32 bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-xs">No image</div>
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-bold text-sm sm:text-base">
                        ${parseFloat(relatedProduct.price).toFixed(2)}
                      </span>
                      {relatedProduct.discount_percentage > 0 && (
                        <span className="text-xs sm:text-sm text-red-600 font-medium">
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
          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed.slice(0, 4).map((rv) => (
                <div
                  key={rv.id}
                  onClick={() => navigate(`/products/${rv.product.id}`)}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {getProductImage(rv.product) ? (
                    <img
                      src={getProductImage(rv.product)}
                      alt={rv.product.title}
                      className="w-full h-24 sm:h-28 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-24 sm:h-28 bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-xs">No image</div>
                    </div>
                  )}
                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
                      {rv.product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-bold text-xs sm:text-sm">
                        ${parseFloat(rv.product.price).toFixed(2)}
                      </span>
                      {rv.product.discount_percentage > 0 && (
                        <span className="text-xs text-red-600 font-medium">
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

      {/* Custom CSS for scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
