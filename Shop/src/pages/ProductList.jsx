import React, { useState, useEffect } from "react";
import { productAPI, categoryAPI } from "../services/api";
import { useStore } from "../context/StoreContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiShoppingCart, 
  FiHeart, 
  FiFilter,
  FiSearch,
  FiX,
  FiGrid,
  FiList,
  FiArrowRight,
  FiStar,
  FiClock,
  FiPackage
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const placeholderImage = (seed, w = 400, h = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

// Grid View Card Component
const GridProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist, isInCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAddingToWishlist(true);
    try {
      await onWishlistToggle(product.id);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img
            src={product.image || placeholderImage(product.slug)}
            alt={product.title}
            className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {product.discount_percentage}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isInWishlist 
                ? "bg-red-500 text-white" 
                : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
            } ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            {isAddingToWishlist ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiHeart className={isInWishlist ? "fill-current" : ""} size={16} />
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category?.name && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`text-xs ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">({product.rating})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-indigo-600">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.discount_percentage > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isInCart}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all duration-200 text-sm ${
              isInCart
                ? "bg-green-100 text-green-700 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : isInCart ? (
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
      </Link>
    </div>
  );
};

// List View Card Component
const ListProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist, isInCart }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAddingToWishlist(true);
    try {
      await onWishlistToggle(product.id);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative sm:w-48 md:w-56 lg:w-64 flex-shrink-0">
            <img
              src={product.image || placeholderImage(product.slug)}
              alt={product.title}
              className="w-full h-48 sm:h-full object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none"
            />
            
            {/* Discount Badge */}
            {product.discount_percentage > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {product.discount_percentage}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col h-full text-left">
              <div className="flex-1">
                {/* Category */}
                {product.category?.name && (
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {product.category.name}
                  </p>
                )}

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
                  {product.title}
                </h3>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Rating and Stock */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {product.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.rating})</span>
                    </div>
                  )}

                  {/* Stock Status */}
                  {product.stock !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPackage size={14} />
                      <span className={product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-600" : "text-red-600"}>
                        {product.stock > 10 ? "In Stock" : product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.discount_percentage > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                        Save {product.discount_percentage}%
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleWishlistToggle}
                    disabled={isAddingToWishlist}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isInWishlist 
                        ? "bg-red-50 border-red-200 text-red-600" 
                        : "bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500"
                    }`}
                  >
                    {isAddingToWishlist ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiHeart className={isInWishlist ? "fill-current" : ""} size={16} />
                    )}
                    <span className="hidden sm:inline text-sm font-medium">
                      {isInWishlist ? "Saved" : "Wishlist"}
                    </span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isInCart}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 text-sm min-w-[140px] justify-center ${
                      isInCart
                        ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
                    }`}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : isInCart ? (
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
          </div>
        </div>
      </Link>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlistProducts,
    cartItems,
  } = useStore();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const search = params.get("search");
    
    if (category) setSelectedCategory(category);
    if (search) setSearchQuery(search);
  }, [location.search]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.list();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.list();
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        if (!p.category) return false;
        return (
          String(p.category.id) === String(selectedCategory) ||
          String(p.category.slug) === String(selectedCategory)
        );
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort products
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleWishlistToggle = async (productId) => {
    try {
      if (!user) {
        navigate("/login", { state: { from: `/products?from=wishlist` } });
        return;
      }

      const isInWishlist = wishlistProducts.some((p) => p.id === productId);
      if (isInWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error("Error managing wishlist:", error);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSortBy("");
    navigate("/products");
  };

  const isInWishlist = (productId) => {
    return wishlistProducts.some((p) => p.id === productId);
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item.product?.id === productId);
  };

  // Loading Skeletons for both views
  const renderLoadingSkeletons = () => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-48 md:w-56 lg:w-64 h-48 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-4 pt-4">
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={fetchProducts}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full mx-auto bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 lg:px-8">
        {/* Header and Controls */}
        <div className="flex flex-col lg:items-center lg:justify-between gap-4 mb-8">
          
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex flex-col md:flex-row items-center">
              <span> All Products</span>
              {filteredProducts.length > 0 && (
                <span className="text-gray-500 text-lg ml-2 self-center md:self-end">
                  ({filteredProducts.length} products)
                </span>
              )}
            </h1>
          

          <div className="flex justify-between gap-3">
            {/* Search Query Display */}
            {searchQuery && (
              <div className="flex  items-center gap-2 text-sm text-gray-600">
                <span>Search results for:</span>
                <span className="font-semibold">"{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
            <div className=" hidden md:flex gap-2">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter size={18} />
              Filters
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid View"
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "text-gray-600 hover:text-gray-900"
                }`}
                title="List View"
              >
                <FiList size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">Sort by</option>
              <option value="name">Name A-Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          </div>
        </div>

        {/* Filters and Products Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.product_count && `(${cat.product_count})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {(selectedCategory || searchQuery) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
                  <div className="space-y-2">
                    {selectedCategory && (
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
                        <span>Category: {categories.find(c => c.id == selectedCategory)?.name}</span>
                        <button
                          onClick={() => setSelectedCategory("")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    )}
                    {searchQuery && (
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
                        <span>Search: "{searchQuery}"</span>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {loading ? (
              renderLoadingSkeletons()
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <GridProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      isInWishlist={isInWishlist(product.id)}
                      isInCart={isInCart(product.id)}
                    />
                  ))}
                </div>
              ) : (
                // List View
                <div className="space-y-6">
                  {filteredProducts.map((product) => (
                    <ListProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      isInWishlist={isInWishlist(product.id)}
                      isInCart={isInCart(product.id)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery || selectedCategory 
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "No products available at the moment."}
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Clear Filters
                    <FiX size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;