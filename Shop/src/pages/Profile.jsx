import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { getProductImage } from "../utils/imageUtils";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiPackage,
  FiEdit,
  FiLogOut,
  FiMapPin,
  FiCreditCard,
  FiHeart,
  FiBell,
  FiLock,
  FiShield,
  FiStar,
  FiShoppingBag,
  FiGift,
  FiDownload,
  FiEye,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiShare2,
  FiCopy,
  FiArrowRight,
  FiMenu,
  FiChevronDown,
} from "react-icons/fi";

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const {
    orders,
    wishlist,
    addresses,
    paymentMethods,
    loadOrders,
    loadAddresses,
    loadPaymentMethods,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  } = useStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
  });

  const [newAddress, setNewAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: "",
    is_default: false,
  });

  const [newPayment, setNewPayment] = useState({
    type: "card",
    card_number: "",
    expiry_date: "",
    cvv: "",
    name_on_card: "",
    is_default: false,
  });

  // UI states
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    two_factor: false,
    login_alerts: true,
    device_management: true,
  });

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadOrders(), loadAddresses()]);
        // Only load payment methods if the function exists
        if (loadPaymentMethods && typeof loadPaymentMethods === "function") {
          await loadPaymentMethods();
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      setEditForm({
        username: user?.username || "",
        email: user?.email || "",
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone || "",
        date_of_birth: user?.date_of_birth || "",
      });
      initializeData();
    }
  }, [user]);

  // Stats calculations
  const stats = {
    totalOrders: orders?.length || 0,
    pendingOrders:
      orders?.filter((o) => o.status?.toLowerCase() === "pending").length || 0,
    wishlistItems: wishlist?.products?.length || 0,
    totalSpent:
      orders?.reduce(
        (sum, order) => sum + parseFloat(order.total_amount || 0),
        0
      ) || 0,
  };

  const recentOrders = orders?.slice(0, 3) || [];
  const recentWishlist = wishlist?.products?.slice(0, 4) || [];

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "shipped":
        return "text-blue-600 bg-blue-100";
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      date_of_birth: user?.date_of_birth || "",
    });
    setIsEditing(false);
  };

  const handleAddAddress = async () => {
    try {
      await addAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress({
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "US",
        phone: "",
        is_default: false,
      });
    } catch (error) {
      console.error("Failed to add address:", error);
    }
  };

  const handleAddPayment = async () => {
    try {
      if (addPaymentMethod && typeof addPaymentMethod === "function") {
        await addPaymentMethod(newPayment);
        setShowAddPayment(false);
        setNewPayment({
          type: "card",
          card_number: "",
          expiry_date: "",
          cvv: "",
          name_on_card: "",
          is_default: false,
        });
      }
    } catch (error) {
      console.error("Failed to add payment method:", error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      if (deletePaymentMethod && typeof deletePaymentMethod === "function") {
        await deletePaymentMethod(paymentId);
      }
    } catch (error) {
      console.error("Failed to delete payment method:", error);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  const handleSetDefaultPayment = async (paymentId) => {
    try {
      if (
        setDefaultPaymentMethod &&
        typeof setDefaultPaymentMethod === "function"
      ) {
        await setDefaultPaymentMethod(paymentId);
      }
    } catch (error) {
      console.error("Failed to set default payment method:", error);
    }
  };

  const handleSecurityToggle = (key) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navigationTabs = [
    { id: "overview", label: "Overview", icon: FiUser },
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "orders", label: "Orders", icon: FiPackage },
    { id: "addresses", label: "Addresses", icon: FiMapPin },
    { id: "payments", label: "Payments", icon: FiCreditCard },
    { id: "wishlist", label: "Wishlist", icon: FiHeart },
    { id: "security", label: "Security", icon: FiShield },
  ];

  const getCurrentTabLabel = () => {
    const currentTab = navigationTabs.find((tab) => tab.id === activeTab);
    return currentTab ? currentTab.label : "My Account";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-gray-400 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your profile.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-indigo-600 text-2xl animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Account
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Welcome back, {user.first_name || user.username}!
              </p>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiMenu className="text-lg" />
                <span className="font-medium">{getCurrentTabLabel()}</span>
                <FiChevronDown
                  className={`text-lg transition-transform ${
                    showMobileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation - Hidden on mobile, shown on desktop */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {(
                      user.first_name?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "U"
                    ).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-1 sm:space-y-2">
                {navigationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors text-sm sm:text-base ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="text-base sm:text-lg flex-shrink-0" />
                    <span className="font-medium truncate">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 mt-4 sm:mt-6 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base"
              >
                <FiLogOut className="text-base sm:text-lg flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {showMobileMenu && (
            <div className="lg:hidden col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {(
                        user.first_name?.charAt(0) ||
                        user.username?.charAt(0) ||
                        "U"
                      ).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {navigationTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                        activeTab === tab.id
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <tab.icon className="text-base flex-shrink-0" />
                      <span className="font-medium truncate">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 mt-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <FiLogOut className="text-base flex-shrink-0" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div
            className={`${
              showMobileMenu ? "lg:col-span-3" : "col-span-1 lg:col-span-3"
            }`}
          >
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Total Orders
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {stats.totalOrders}
                        </p>
                      </div>
                      <FiShoppingBag className="text-indigo-600 text-lg sm:text-xl" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Wishlist
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          {stats.wishlistItems}
                        </p>
                      </div>
                      <FiHeart className="text-red-600 text-lg sm:text-xl" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Pending
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                          {stats.pendingOrders}
                        </p>
                      </div>
                      <FiPackage className="text-yellow-600 text-lg sm:text-xl" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Total Spent
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">
                          ${stats.totalSpent.toFixed(2)}
                        </p>
                      </div>
                      <FiGift className="text-green-600 text-lg sm:text-xl" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders & Wishlist */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Recent Orders - Horizontal Scroll for Mobile */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Recent Orders
                      </h2>
                      <button
                        onClick={() => (window.location.href = "/orders")}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                      >
                        View All <FiArrowRight className="text-xs" />
                      </button>
                    </div>

                    {/* Mobile Horizontal Scroll */}
                    <div className="block lg:hidden">
                      <div className="relative">
                        <div
                          id="orders-scroll-mobile"
                          className="flex overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <div className="flex gap-3">
                            {recentOrders.map((order) => (
                              <div
                                key={order.id}
                                className="flex-shrink-0 w-64 border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-gray-900 text-sm truncate">
                                    Order #{order.id}
                                  </h3>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  $
                                  {parseFloat(order.total_amount || 0).toFixed(
                                    2
                                  )}
                                </p>
                                <button className="w-full mt-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors">
                                  View Details
                                </button>
                              </div>
                            ))}
                            {recentOrders.length === 0 && (
                              <div className="flex-shrink-0 w-64 text-center py-8">
                                <p className="text-gray-500 text-sm">
                                  No recent orders
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Vertical Layout */}
                    <div className="hidden lg:block space-y-3">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 text-sm truncate">
                                Order #{order.id}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}{" "}
                              • $
                              {parseFloat(order.total_amount || 0).toFixed(2)}
                            </p>
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-700 text-xs font-medium ml-2">
                            View
                          </button>
                        </div>
                      ))}
                      {recentOrders.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No recent orders
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Wishlist - Horizontal Scroll for Mobile */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Wishlist
                      </h2>
                      <button
                        onClick={() => setActiveTab("wishlist")}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                      >
                        View All <FiArrowRight className="text-xs" />
                      </button>
                    </div>

                    {/* Mobile Horizontal Scroll */}
                    <div className="block lg:hidden">
                      <div className="relative">
                        <div
                          id="wishlist-scroll-mobile"
                          className="flex overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <div className="flex gap-4">
                            {recentWishlist.map((item) => (
                              <div
                                key={item.id}
                                className="flex-shrink-0 w-32 text-center"
                              >
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  {getProductImage(item) ? (
                                    <img
                                      src={getProductImage(item)}
                                      alt={item.title}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center ${
                                      getProductImage(item) ? "hidden" : "flex"
                                    }`}
                                  >
                                    <FiPackage className="text-gray-400" />
                                  </div>
                                </div>
                                <p className="text-xs text-gray-900 font-medium truncate mb-1">
                                  {item.title || "Product"}
                                </p>
                                <p className="text-xs text-gray-600 mb-2">
                                  ${item.price || "0.00"}
                                </p>
                                <button className="w-full py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors">
                                  Add to Cart
                                </button>
                              </div>
                            ))}
                            {recentWishlist.length === 0 && (
                              <div className="flex-shrink-0 w-64 text-center py-8">
                                <p className="text-gray-500 text-sm">
                                  Your wishlist is empty
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden lg:grid grid-cols-2 gap-3">
                      {recentWishlist.map((item) => (
                        <div key={item.id} className="text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            {getProductImage(item) ? (
                              <img
                                src={getProductImage(item)}
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center ${
                                getProductImage(item) ? "hidden" : "flex"
                              }`}
                            >
                              <FiHeart className="text-gray-400" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-900 font-medium truncate">
                            {item.title || "Product"}
                          </p>
                          <p className="text-xs text-gray-600">
                            ${item.price || "0.00"}
                          </p>
                        </div>
                      ))}
                      {recentWishlist.length === 0 && (
                        <div className="col-span-2 text-center py-4">
                          <p className="text-gray-500 text-sm">
                            Your wishlist is empty
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      <FiMapPin className="text-indigo-600 text-lg sm:text-xl mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Addresses
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      <FiCreditCard className="text-indigo-600 text-lg sm:text-xl mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Payments
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("security")}
                      className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      <FiShield className="text-indigo-600 text-lg sm:text-xl mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Security
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      <FiEdit className="text-sm" />
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user.first_name || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user.last_name || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.date_of_birth}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              date_of_birth: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user.date_of_birth || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Order History
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FiPackage className="text-gray-400 text-4xl mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start shopping to see your orders here.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/products")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Order #{order.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} items
                          </p>
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <FiPlus className="text-sm" />
                    Add Address
                  </button>
                </div>

                {showAddAddress && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Add New Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddress.line1}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            line1: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Apartment, Suite, etc."
                        value={newAddress.line2}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            line2: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={newAddress.postal_code}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postal_code: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newAddress.is_default}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              is_default: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          Set as default address
                        </span>
                      </label>
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={handleAddAddress}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowAddAddress(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <FiMapPin className="text-gray-400 text-3xl mx-auto mb-3" />
                      <p className="text-gray-600">No addresses saved yet.</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {address.label || "Address"}
                              </h3>
                              {address.is_default && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.line1}
                              {address.line2 && `, ${address.line2}`}
                              <br />
                              {address.city}, {address.state}{" "}
                              {address.postal_code}
                              <br />
                              {address.phone && `Phone: ${address.phone}`}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!address.is_default && (
                              <button
                                onClick={() =>
                                  handleSetDefaultAddress(address.id)
                                }
                                className="text-indigo-600 hover:text-indigo-700 text-sm"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Payment Methods
                  </h2>
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <FiPlus className="text-sm" />
                    Add Payment Method
                  </button>
                </div>

                {showAddPayment && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Add New Payment Method
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        value={newPayment.name_on_card}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            name_on_card: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={newPayment.card_number}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            card_number: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={newPayment.expiry_date}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            expiry_date: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={newPayment.cvv}
                        onChange={(e) =>
                          setNewPayment({ ...newPayment, cvv: e.target.value })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newPayment.is_default}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              is_default: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          Set as default payment method
                        </span>
                      </label>
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={handleAddPayment}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowAddPayment(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {!paymentMethods || paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCreditCard className="text-gray-400 text-3xl mx-auto mb-3" />
                      <p className="text-gray-600">
                        No payment methods saved yet.
                      </p>
                    </div>
                  ) : (
                    paymentMethods.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FiCreditCard className="text-gray-400" />
                              <h3 className="font-semibold text-gray-900">
                                {payment.name_on_card}
                              </h3>
                              {payment.is_default && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              **** **** **** {payment.last4} • Expires{" "}
                              {payment.exp_month}/{payment.exp_year}
                              <br />
                              {payment.brand}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!payment.is_default && (
                              <button
                                onClick={() =>
                                  handleSetDefaultPayment(payment.id)
                                }
                                className="text-indigo-600 hover:text-indigo-700 text-sm"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                    My Wishlist
                  </h2>
                  <span className="text-gray-600 text-sm sm:text-base">
                    {wishlist?.products?.length || 0} items
                  </span>
                </div>

                {wishlist?.products?.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <FiHeart className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start adding items you love!
                    </p>
                    <button
                      onClick={() => (window.location.href = "/products")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {wishlist.products.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100 relative">
                          {getProductImage(item) ? (
                            <img
                              src={getProductImage(item)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full bg-gray-200 flex items-center justify-center absolute top-0 left-0 ${
                              getProductImage(item) ? "hidden" : "flex"
                            }`}
                          >
                            <FiHeart className="text-gray-400 text-2xl" />
                          </div>
                          <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600">
                            <FiHeart className="text-base" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {item.title || "Product"}
                          </h3>
                          <p className="text-indigo-600 font-semibold text-sm mb-2">
                            ${item.price || "0.00"}
                          </p>
                          <button className="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Security Features
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(securitySettings).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {key.replace("_", " ")}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === "two_factor" &&
                                "Add an extra layer of security to your account"}
                              {key === "login_alerts" &&
                                "Get notified of new sign-ins"}
                              {key === "device_management" &&
                                "Manage your trusted devices"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSecurityToggle(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? "bg-indigo-600" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Password
                    </h3>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Profile;
