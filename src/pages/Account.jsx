import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  ShoppingCart,
  Heart,
  CreditCard,
  Zap,
  LogOut,
  HelpCircle,
  TrendingUp,
  Home,
  Edit2,
  FileText,
  Info,
  BookOpen,
  Star,
  Settings,
} from "react-feather";

const Account = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not logged in.");
      return;
    }
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUser(data);
      })
      .catch(() => setError("Failed to fetch user details."));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/");
  };



  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow">Loading account...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white  rounded-xl shadow-xl p-8 my-10"
      >
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-3">
            <User size={36} className="text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-indigo-500">
              {user.username}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500">{user.phone || "No phone"}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            className="flex items-center space-x-2 bg-indigo-50 dark:bg-gray-300 rounded-lg p-4 hover:bg-indigo-100 dark:hover:bg-indigo-700 transition"
            onClick={() => navigate("/orders")}
          >
            <ShoppingCart size={22} className="text-indigo-500" />
            <span className="font-medium">Orders</span>
          </button>
          <button
            className="flex items-center space-x-2 bg-pink-50 dark:bg-gray-300 rounded-lg p-4 hover:bg-pink-100 dark:hover:bg-indigo-700 transition"
            onClick={() => navigate("/wishlist")}
          >
            <Heart size={22} className="text-pink-500" />
            <span className="font-medium">Wishlist</span>
          </button>
          <button
            className="flex items-center space-x-2 bg-green-50 dark:bg-gray-300 rounded-lg p-4 hover:bg-green-100 dark:hover:bg-indigo-700 transition"
            onClick={() => navigate("/helpcenter")}
          >
            <HelpCircle size={22} className="text-green-500" />
            <span className="font-medium">Help Center</span>
          </button>
          <button
            className="flex items-center space-x-2 bg-yellow-50 dark:bg-gray-300 rounded-lg p-4 hover:bg-yellow-100 dark:hover:bg-indigo-700 transition"
            onClick={() => navigate("/finance")}
          >
            <TrendingUp size={22} className="text-yellow-500" />
            <span className="font-medium">ShopEase EMI Options</span>
          </button>
        </div>

        {/* Credit Score & Recently Viewed */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-blue-50 dark:bg-gray-300 rounded-lg p-4 mb-3">
            <div className="flex items-center space-x-3">
              <Star size={22} className="text-blue-500" />
              <span className="font-medium">Free Credit Score Check</span>
            </div>
            <button
              className="text-blue-600 hover:underline font-semibold"
              onClick={() =>
                window.open("https://www.cibil.com/freecibilscore", "_blank")
              }
            >
              Check Now
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-300 rounded-lg p-4">
            <div className="flex items-center mb-2 space-x-2">
              <BookOpen size={20} className="text-indigo-500" />
              <span className="font-medium">Recently Viewed Stores</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {/* You can fetch and map user's recently viewed stores here if available */}
              {/* Example: */}
              {/* {user.recentlyViewedStores?.map((store) => (
                <span
                  key={store}
                  className="bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {store}
                </span>
              ))} */}
              <span className="text-gray-400">No data</span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mb-8">
          <div className="flex items-center mb-2 space-x-2">
            <Settings size={20} className="text-indigo-500" />
            <span className="font-medium">Account Settings</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              className="flex items-center space-x-2 bg-indigo-50 dark:bg-gray-300 rounded-lg p-3 hover:bg-indigo-100 dark:hover:bg-indigo-700 transition"
              onClick={() => navigate("/account/edit")}
            >
              <Edit2 size={18} className="text-indigo-500" />
              <span>Edit Profile</span>
            </button>
            <button
              className="flex items-center space-x-2 bg-blue-50 dark:bg-gray-300 rounded-lg p-3 hover:bg-blue-100 dark:hover:bg-indigo-700 transition"
              onClick={() => navigate("/account/cards")}
            >
              <CreditCard size={18} className="text-blue-500" />
              <span>Saved Cards</span>
            </button>
            <button
              className="flex items-center space-x-2 bg-green-50 dark:bg-gray-300 rounded-lg p-3 hover:bg-green-100 dark:hover:bg-indigo-700 transition"
              onClick={() => navigate("/account/upi")}
            >
              <Zap size={18} className="text-green-500" />
              <span>UPI</span>
            </button>
            <button
              className="flex items-center space-x-2 bg-pink-50 dark:bg-gray-300 rounded-lg p-3 hover:bg-pink-100 dark:hover:bg-indigo-700 transition"
              onClick={() => navigate("/account/address")}
            >
              <Home size={18} className="text-pink-500" />
              <span>Saved Address</span>
            </button>
          </div>
        </div>

        {/* Feedback & Information */}
        <div className="mb-8">
          <div className="flex items-center mb-2 space-x-2">
            <Info size={20} className="text-indigo-500" />
            <span className="font-medium">Feedback & Information</span>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <a
              href="/terms"
              className="flex items-center space-x-2 text-gray-700 hover:underline"
            >
              <FileText size={16} />
              <span>Terms, Policies and Licenses</span>
            </a>
          </div>
        </div>

        {/* Theme & Logout */}
        <div className="flex items-center justify-end gap-4">
          <button
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Account;
