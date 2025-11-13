import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext";
import { productAPI, categoryAPI } from "../services/api";
import {
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiHome,
  FiMapPin,
  FiPackage,
  FiGrid,
  FiClock,
} from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, wishlistProducts } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Search states
  const [searchResults, setSearchResults] = useState({
    products: [],
    categories: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const cartItemsCount = (cartItems && cartItems.length) || 0;
  const wishlistCount = (wishlistProducts && wishlistProducts.length) || 0;

  // Navigation links for mobile menu
  const navLinks = [
    { path: "/", label: "Home", icon: <FiHome size={18} /> },
    { path: "/products", label: "Products", icon: <FiSearch size={18} /> },
    { path: "/wishlist", label: "Wishlist", icon: <FiHeart size={18} /> },
    { path: "/cart", label: "Cart", icon: <FiShoppingCart size={18} /> },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = (query) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      ),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Search products and categories
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ products: [], categories: [] });
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    try {
      // Search products
      const productsResponse = await productAPI.list({
        search: query,
        limit: 5,
      });

      // Search categories
      const categoriesResponse = await categoryAPI.list();
      const filteredCategories = categoriesResponse.data
        .filter((category) =>
          category.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3);

      setSearchResults({
        products: productsResponse.data?.results || productsResponse.data || [],
        categories: filteredCategories,
      });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ products: [], categories: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults({ products: [], categories: [] });
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user's location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const { city, town, village, county, state, country } =
              data.address;
            const locationName = city || town || village || county || state;
            setUserLocation(`${locationName}, ${country}`);
          } else {
            setLocationError("Could not determine location");
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          setLocationError("Failed to fetch location details");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
            break;
        }
      }
    );
  };

  // Auto-fetch location when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      setShowSuggestions(false);
      setSearchQuery("");
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (type, item, query = null) => {
    const searchTerm = query || item.name || item.title;
    saveToRecentSearches(searchTerm);

    setShowSuggestions(false);
    setSearchQuery("");

    if (type === "product") {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else if (type === "category") {
      navigate(`/products?category=${item.slug || item.id}`);
    } else if (type === "recent") {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleRecentSearchClick = (search) => {
    setShowSuggestions(false);
    saveToRecentSearches(search);
    navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleRetryLocation = () => {
    getLocation();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50 se-navbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Main Navbar Row */}
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo and Location */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex-shrink-0"
              >
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ShopEase
                </span>
              </Link>

              {/* Location Display */}
              <div className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-[140px] lg:max-w-[160px] truncate">
                <FiMapPin size={14} className="text-gray-700 flex-shrink-0" />
                <div className="truncate">
                  {isLoadingLocation ? (
                    <span className="text-gray-500 text-xs">Detecting...</span>
                  ) : locationError ? (
                    <button
                      onClick={handleRetryLocation}
                      className="text-gray-700 hover:text-gray-900 text-xs truncate p-0"
                      title="Retry location detection"
                    >
                      INDIA
                    </button>
                  ) : userLocation ? (
                    <span title={userLocation} className="truncate">
                      {userLocation}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      Location unknown
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Section - Search Bar with Suggestions */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-6">
              <div ref={searchRef} className="relative w-full">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search products, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchQuery.trim() && setShowSuggestions(true)
                    }
                    className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                  >
                    <FiSearch size={16} />
                  </button>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Loading State */}
                    {isSearching && (
                      <div className="p-4 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-t-2 border-indigo-600 border-solid rounded-full animate-spin"></div>
                          Searching...
                        </div>
                      </div>
                    )}

                    {/* Recent Searches */}
                    {!isSearching &&
                      recentSearches.length > 0 &&
                      !searchQuery && (
                        <div className="border-b border-gray-100">
                          <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                            <span className="text-xs font-semibold text-gray-500">
                              RECENT SEARCHES
                            </span>
                            <button
                              onClick={clearRecentSearches}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Clear
                            </button>
                          </div>
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleRecentSearchClick(search)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0 transition-colors"
                            >
                              <FiClock className="text-gray-400" size={16} />
                              <span className="text-sm text-gray-700">
                                {search}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                    {/* Categories Results */}
                    {!isSearching && searchResults.categories.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-gray-50">
                          <span className="text-xs font-semibold text-gray-500">
                            CATEGORIES
                          </span>
                        </div>
                        {searchResults.categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() =>
                              handleSuggestionClick("category", category)
                            }
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0 transition-colors"
                          >
                            <FiGrid className="text-indigo-500" size={16} />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {category.name}
                              </div>
                              {category.product_count && (
                                <div className="text-xs text-gray-500">
                                  {category.product_count} products
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Products Results */}
                    {!isSearching && searchResults.products.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50">
                          <span className="text-xs font-semibold text-gray-500">
                            PRODUCTS
                          </span>
                        </div>
                        {searchResults.products.map((product) => (
                          <button
                            key={product.id}
                            onClick={() =>
                              handleSuggestionClick("product", product)
                            }
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0 transition-colors"
                          >
                            <FiPackage className="text-green-500" size={16} />
                            <div className="flex items-center gap-3 flex-1">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {product.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  $
                                  {typeof product.price === "number"
                                    ? product.price.toFixed(2)
                                    : product.price}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {!isSearching &&
                      searchQuery &&
                      searchResults.products.length === 0 &&
                      searchResults.categories.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No results found for "{searchQuery}"
                        </div>
                      )}

                    {/* View All Results */}
                    {!isSearching && searchQuery && (
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-indigo-600 flex items-center justify-center gap-2 transition-colors"
                        >
                          View all results for "{searchQuery}"
                          <FiSearch size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Only Username or Login Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist - Hidden on desktop, shown in mobile menu */}
              <Link
                to="/wishlist"
                className="hidden md:flex relative p-2 text-gray-700 hover:text-indigo-600 transition-colors group"
                title="Wishlist"
              >
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart - Hidden on desktop, shown in mobile menu */}
              <Link
                to="/cart"
                className="hidden md:flex relative p-2 text-gray-700 hover:text-indigo-600 transition-colors group"
                title="Cart"
              >
                <FiShoppingCart size={18} className="sm:size-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Section - Only Username or Login Button */}
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Username only - no icon */}
                  <span className="text-sm font-medium text-gray-700 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 max-w-[120px] truncate"
                  onClick={() => navigate("/profile")}>
                    {user.username}
                  </span>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar and Location Row */}
          <div className="md:hidden pb-3 space-y-2 border-t border-gray-200 pt-2">
            {/* Mobile Location Display */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <FiMapPin size={12} className="text-gray-700" />
                <div className="max-w-[140px] truncate">
                  {isLoadingLocation ? (
                    <span className="text-gray-500">Detecting location...</span>
                  ) : locationError ? (
                    <button
                      onClick={handleRetryLocation}
                      className="text-gray-700 hover:text-gray-900 underline"
                      title="Retry location detection"
                    >
                      INDIA
                    </button>
                  ) : userLocation ? (
                    <span title={userLocation} className="truncate">
                      {userLocation}
                    </span>
                  ) : (
                    <span className="text-gray-500">Location unknown</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/wishlist"
                  className="xs:hidden flex relative p-1 text-gray-700 hover:text-indigo-600 transition-colors"
                  title="Wishlist"
                >
                  <FiHeart size={16} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {/* Cart - Hidden on desktop, shown in mobile menu */}
                <Link
                  to="/cart"
                  className="xs:hidden flex relative p-1 text-gray-700 hover:text-indigo-600 transition-colors"
                  title="Cart"
                >
                  <FiShoppingCart size={18} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                >
                  <FiSearch size={16} />
                </button>
              </form>

              {/* Mobile Search Suggestions */}
              {showSuggestions && (
                <div
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-80 overflow-y-auto z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Same mobile suggestions structure as desktop but compact */}
                  {isSearching && (
                    <div className="p-3 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-t-2 border-indigo-600 border-solid rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    </div>
                  )}

                  {!isSearching &&
                    recentSearches.length > 0 &&
                    !searchQuery && (
                      <div className="border-b border-gray-100">
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                          <span className="text-xs font-semibold text-gray-500">
                            RECENT
                          </span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(search)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-b-0 transition-colors"
                          >
                            <FiClock className="text-gray-400" size={14} />
                            <span className="text-sm text-gray-700 truncate">
                              {search}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {!isSearching && searchResults.categories.length > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="px-3 py-2 bg-gray-50">
                        <span className="text-xs font-semibold text-gray-500">
                          CATEGORIES
                        </span>
                      </div>
                      {searchResults.categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() =>
                            handleSuggestionClick("category", category)
                          }
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <FiGrid className="text-indigo-500" size={14} />
                          <span className="text-sm text-gray-900 truncate">
                            {category.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {!isSearching && searchResults.products.length > 0 && (
                    <div>
                      <div className="px-3 py-2 bg-gray-50">
                        <span className="text-xs font-semibold text-gray-500">
                          PRODUCTS
                        </span>
                      </div>
                      {searchResults.products.slice(0, 3).map((product) => (
                        <button
                          key={product.id}
                          onClick={() =>
                            handleSuggestionClick("product", product)
                          }
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <FiPackage className="text-green-500" size={14} />
                          <span className="text-sm text-gray-900 truncate flex-1">
                            {product.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            ${product.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {!isSearching &&
                    searchQuery &&
                    searchResults.products.length === 0 &&
                    searchResults.categories.length === 0 && (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        No results for "{searchQuery}"
                      </div>
                    )}

                  {!isSearching && searchQuery && (
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full px-3 py-2 hover:bg-gray-50 text-sm font-medium text-indigo-600 text-center transition-colors"
                      >
                        Search for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 fixed inset-0 top-16 z-40 overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {/* User Info in Mobile Menu */}
              {user && (
                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <FiUser size={18} className="text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-900 place-self-start">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute(link.path)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                  {link.path === "/wishlist" && wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                  {link.path === "/cart" && cartItemsCount > 0 && (
                    <span className="ml-auto bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              ))}

              {/* Mobile User Actions */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      <FiUser size={18} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      <FiLogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:border-indigo-600 transition-colors font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
