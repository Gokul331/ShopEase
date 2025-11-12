import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
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
    type: "home",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
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
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    promotions: true,
    order_updates: true,
    price_drops: true,
    new_arrivals: false,
  });

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([loadOrders(), loadAddresses(), loadPaymentMethods()]);
      setLoading(false);
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

  // Stats calculations - FIXED: Access wishlist.products instead of wishlist
  const stats = {
    totalOrders: orders?.length || 0,
    pendingOrders:
      orders?.filter((o) => o.status?.toLowerCase() === "pending").length || 0,
    wishlistItems: wishlist?.products?.length || 0, // FIXED
    totalSpent:
      orders?.reduce(
        (sum, order) => sum + parseFloat(order.total_amount || 0),
        0
      ) || 0,
  };

  const recentOrders = orders?.slice(0, 3) || [];
  // FIXED: Access wishlist.products instead of wishlist
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
        type: "home",
        street: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        is_default: false,
      });
    } catch (error) {
      console.error("Failed to add address:", error);
    }
  };

  const handleAddPayment = async () => {
    try {
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
      await deletePaymentMethod(paymentId);
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
      await setDefaultPaymentMethod(paymentId);
    } catch (error) {
      console.error("Failed to set default payment method:", error);
    }
  };

  const navigationTabs = [
    { id: "overview", label: "Overview", icon: FiUser },
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "orders", label: "Orders", icon: FiPackage },
    { id: "addresses", label: "Addresses", icon: FiMapPin },
    { id: "payments", label: "Payments", icon: FiCreditCard },
    { id: "wishlist", label: "Wishlist", icon: FiHeart },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "security", label: "Security", icon: FiShield },
  ];

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Account
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Welcome back, {user.first_name || user.username}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
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

          {/* Main Content */}
          <div className="lg:col-span-3">
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
                  {/* Recent Orders */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Recent Orders
                      </h2>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                      >
                        View All <FiArrowRight className="text-xs" />
                      </button>
                    </div>
                    <div className="space-y-3">
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

                  {/* Wishlist */}
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
                    <div className="grid grid-cols-2 gap-3">
                      {recentWishlist.map((item) => (
                        <div key={item.id} className="text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FiPackage className="text-gray-400" />
                            )}
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
                      onClick={() => setActiveTab("notifications")}
                      className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      <FiBell className="text-indigo-600 text-lg sm:text-xl mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Notifications
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

            {/* Wishlist Tab - FIXED: Access wishlist.products */}
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
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="text-gray-400 text-2xl" />
                            </div>
                          )}
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

            {/* Other tabs (Profile, Orders, Addresses, Payments, Notifications, Security) remain the same */}
            {/* ... rest of the component code for other tabs ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
