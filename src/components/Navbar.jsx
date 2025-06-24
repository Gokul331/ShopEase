import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Package,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronDown,
  User,
} from "react-feather";
import { Link, useNavigate } from "react-router-dom";
import { getCart } from "../utils/cartStorage";
import { getWishlist } from "../utils/wishlistStorage";

const OPENWEATHER_API_KEY = "716631113085546c665745a4c83cc92a";

// Animation variants
const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15 },
  },
};

const iconVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: { type: "spring", stiffness: 300 },
  },
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [wishlistItems, setWishlistItems] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Detecting...");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [manualLocation, setManualLocation] = useState("");
  const [prevLocation, setPrevLocation] = useState("");
  const navigate = useNavigate();

  const orderLinks = [
    { name: "Your Orders", path: "/orders" },
    { name: "Returns & Refunds", path: "/returns" },
    { name: "Order History", path: "/order-history" },
    { name: "Buy Again", path: "/buy-again" },
  ];

  // Detect user's location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              try {
                const res = await fetch(
                  `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
                );
                const data = await res.json();
                if (data.name && data.sys?.country) {
                  setPrevLocation(location !== "Detecting..." ? location : "");
                  setLocation(`${data.name}, ${data.sys.country}`);
                } else {
                  setLocation("India");
                }
              } catch {
                setLocation("India");
              }
              setIsLoadingLocation(false);
            },
            () => {
              setLocation("India");
              setIsLoadingLocation(false);
            }
          );
        } else {
          setLocation("India");
          setIsLoadingLocation(false);
        }
      } catch {
        setLocation("India");
        setIsLoadingLocation(false);
      }
    };
    detectLocation();
    // eslint-disable-next-line
  }, []);

  // Cart & Wishlist count (live update)
  useEffect(() => {
    const updateCounts = () => {
      const cart = getCart();
      const cartCount = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
      setCartItems(cartCount);

      const wishlist = getWishlist();
      setWishlistItems(wishlist.length);
    };

    updateCounts();

    // Listen for storage changes (other tabs)
    window.addEventListener("storage", updateCounts);

    // Listen for custom events (same tab)
    const handleCustomCartEvent = () => updateCounts();
    window.addEventListener("cartUpdated", handleCustomCartEvent);
    window.addEventListener("wishlistUpdated", handleCustomCartEvent);

    return () => {
      window.removeEventListener("storage", updateCounts);
      window.removeEventListener("cartUpdated", handleCustomCartEvent);
      window.removeEventListener("wishlistUpdated", handleCustomCartEvent);
    };
  }, [cartItems, wishlistItems]);

  // Scroll effect for navbar shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Dropdown logic: only one open at a time
  const handleLocationDropdown = () => {
    setShowLocationDropdown((open) => !open);
    setShowOrdersDropdown(false);
  };
  const handleOrdersDropdown = () => {
    setShowOrdersDropdown((open) => !open);
    setShowLocationDropdown(false);
  };

  // Manual location update
  const handleLocationUpdate = (e) => {
    e.preventDefault();
    if (manualLocation.trim()) {
      setPrevLocation(location);
      setLocation(manualLocation);
      setShowLocationDropdown(false);
      setManualLocation("");
    }
  };

  // Search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}`);
  };

  // Navbar glassmorphism style
  const navBg = isScrolled
    ? "backdrop-blur bg-white/80 shadow-lg"
    : "backdrop-blur bg-white/60";

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed w-full z-50 bg-yellow-400 ${navBg} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center group" tabIndex={0}>
            <motion.span
              whileHover={{ scale: 1.1, rotate: 0 }}
              className="text-3xl font-extrabold text-indigo-600 tracking-tight drop-shadow"
            >
              <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent ">
                ShopEase
              </span>
            </motion.span>
          </Link>

          {/* Search Bar */}
          <motion.form
            whileFocus={{ scale: 1.03 }}
            className="flex-1 max-w-xl mx-6"
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Product search"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                className="w-full py-2 px-5 pr-12 rounded-full border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              <motion.button
                type="submit"
                className="absolute right-3 top-3 text-indigo-500 hover:text-pink-500"
                aria-label="Search"
                whileHover={{ scale: 1.2, rotate: 15 }}
              >
                <Search size={20} />
              </motion.button>
            </div>
          </motion.form>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Location Dropdown */}
            <div className="relative">
              <motion.button
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                onClick={handleLocationDropdown}
                aria-haspopup="dialog"
                aria-expanded={showLocationDropdown}
                type="button"
              >
                <MapPin size={20} className="mr-1 text-indigo-600" />
                <span className="text-md font-medium">
                  {isLoadingLocation ? (
                    <span className="animate-pulse">Detecting...</span>
                  ) : (
                    location
                  )}
                </span>
                <ChevronDown size={16} className="ml-1 text-gray-400" />
              </motion.button>
              <AnimatePresence>
                {showLocationDropdown && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 p-5 border border-indigo-100"
                  >
                    <div className="mb-2 text-xs text-gray-500">
                      {prevLocation && (
                        <div>
                          <span className="font-semibold">Previous: </span>
                          {prevLocation}
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleLocationUpdate}>
                      <input
                        type="text"
                        placeholder="Enter city or area"
                        className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-indigo-400"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-2 rounded-lg font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition"
                      >
                        Update Location
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Orders & Returns Dropdown */}
            <div className="relative">
              <motion.button
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="flex items-center px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                onClick={handleOrdersDropdown}
                aria-haspopup="menu"
                aria-expanded={showOrdersDropdown}
                type="button"
              >
                <Package size={20} className="mr-1 text-indigo-600" />
                <span className="text-md font-medium">Orders & Returns</span>
                <ChevronDown size={16} className="ml-1 text-gray-400" />
              </motion.button>
              <AnimatePresence>
                {showOrdersDropdown && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 border border-indigo-100"
                  >
                    {orderLinks.map((link) => (
                      <motion.div
                        key={link.name}
                        whileHover={{
                          scale: 1.05,
                          x: 8,
                          backgroundColor: "#f0f4ff",
                        }}
                        className="px-5 py-3 text-gray-700 cursor-pointer rounded-lg"
                        onClick={() => {
                          setShowOrdersDropdown(false);
                          navigate(link.path);
                        }}
                      >
                        {link.name}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <motion.div
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className="relative"
            >
              <Link
                to="/wishlist"
                className="flex items-center group"
                aria-label="Wishlist"
              >
                <Heart
                  size={25}
                  className="text-pink-500 group-hover:animate-bounce"
                />
                {wishlistItems > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      repeatType: "reverse",
                    }}
                    className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow"
                  >
                    {wishlistItems}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Cart */}
            <motion.div
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className="relative"
            >
              <Link
                to="/cart"
                className="flex items-center group"
                aria-label="Cart"
              >
                <ShoppingCart
                  size={25}
                  className="text-indigo-600 group-hover:animate-bounce"
                />
                {cartItems > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      repeatType: "reverse",
                    }}
                    className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow"
                  >
                    {cartItems}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Icon */}
            <motion.button
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className="flex items-center bg-transparent border-0"
              aria-label="My Account"
              onClick={() => navigate("/login")}
              tabIndex={0}
              type="button"
            >
              <User size={25} className="text-gray-700" />
            </motion.button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex items-center justify-between py-3">
          <motion.button
            whileTap={{ scale: 0.85, rotate: 90 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-indigo-600 hover:text-pink-500 focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </motion.button>
          <Link to="/" className="flex items-center" tabIndex={0}>
            <span className="text-xl font-extrabold text-indigo-600 tracking-tight">
              ShopEase
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Link
                to="/wishlist"
                className="flex items-center"
                aria-label="Wishlist"
              >
                <Heart size={22} className="text-pink-500" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">
                    {wishlistItems}
                  </span>
                )}
              </Link>
            </div>
            <div className="relative">
              <Link to="/cart" className="flex items-center" aria-label="Cart">
                <ShoppingCart size={22} className="text-indigo-600" />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">
                    {cartItems}
                  </span>
                )}
              </Link>
            </div>
            <button
              className="flex items-center bg-transparent border-0"
              aria-label="My Account"
              onClick={() => navigate("/login")}
              tabIndex={0}
              type="button"
            >
              <User size={22} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {!isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden my-3"
            >
              <form
                className="relative"
                onSubmit={handleSearchSubmit}
                role="search"
                aria-label="Product search"
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2 text-indigo-500 hover:text-pink-500"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="fixed top-0 right-0 w-72 h-full bg-white shadow-2xl z-50 flex flex-col"
            >
              <motion.button
                whileTap={{ scale: 0.85, rotate: 90 }}
                className="self-end m-4"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={28} />
              </motion.button>
              <div className="flex flex-col space-y-6 px-6 mt-8">
                {/* Location */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center space-x-2 cursor-pointer py-2"
                  onClick={handleLocationDropdown}
                  aria-haspopup="dialog"
                  aria-expanded={showLocationDropdown}
                  tabIndex={0}
                >
                  <MapPin size={20} className="text-indigo-600" />
                  <span className="text-sm font-medium">
                    {isLoadingLocation ? (
                      <span className="animate-pulse">Detecting...</span>
                    ) : (
                      location
                    )}
                  </span>
                  <ChevronDown size={16} className="ml-1 text-gray-400" />
                </motion.div>
                <AnimatePresence>
                  {showLocationDropdown && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="bg-white rounded-xl shadow-xl border border-indigo-100 p-4 mb-2"
                    >
                      <div className="mb-2 text-xs text-gray-500">
                        {prevLocation && (
                          <div>
                            <span className="font-semibold">Previous: </span>
                            {prevLocation}
                          </div>
                        )}
                      </div>
                      <form onSubmit={handleLocationUpdate}>
                        <input
                          type="text"
                          placeholder="Enter city or area"
                          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-indigo-400"
                          value={manualLocation}
                          onChange={(e) => setManualLocation(e.target.value)}
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-2 rounded-lg font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition"
                        >
                          Update Location
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Orders & Returns */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center space-x-2 cursor-pointer py-2"
                  onClick={handleOrdersDropdown}
                  aria-haspopup="menu"
                  aria-expanded={showOrdersDropdown}
                  tabIndex={0}
                >
                  <Package size={20} className="text-indigo-600" />
                  <span className="text-sm font-medium">Orders & Returns</span>
                  <ChevronDown size={16} className="ml-1 text-gray-400" />
                </motion.div>
                <AnimatePresence>
                  {showOrdersDropdown && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="bg-white rounded-xl shadow-xl border border-indigo-100 p-2 mb-2"
                    >
                      {orderLinks.map((link) => (
                        <motion.div
                          key={link.name}
                          whileHover={{
                            scale: 1.05,
                            x: 8,
                            backgroundColor: "#f0f4ff",
                          }}
                          className="px-4 py-3 text-gray-700 cursor-pointer rounded-lg"
                          onClick={() => {
                            setShowOrdersDropdown(false);
                            setIsMenuOpen(false);
                            navigate(link.path);
                          }}
                        >
                          {link.name}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="flex items-center space-x-2 py-2 text-pink-500 font-semibold hover:underline"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Wishlist"
                >
                  <Heart size={20} />
                  <span>Wishlist ({wishlistItems})</span>
                </Link>
                {/* User Account */}
                <Link
                  to="/account"
                  className="flex items-center space-x-2 py-2 text-indigo-600 font-semibold hover:underline"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="My Account"
                >
                  <User size={20} />
                  <span>My Account</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
