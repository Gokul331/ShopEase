import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { FiUser, FiMail, FiCalendar, FiPackage, FiEdit, FiLogOut } from "react-icons/fi";

const Profile = () => {
  const { user, logout } = useAuth();
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 5) || [];

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSaveProfile = async () => {
    // Implement profile update logic here
    console.log("Saving profile:", editForm);
    setIsEditing(false);
    // You would typically call an API to update the user profile
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.username}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: FiUser },
                  { id: "orders", label: "Orders", icon: FiPackage },
                  { id: "settings", label: "Settings", icon: FiCalendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="text-lg" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="text-lg" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <FiEdit className="text-lg" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
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
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FiUser className="text-gray-400 text-xl" />
                        <div>
                          <p className="text-sm text-gray-600">Username</p>
                          <p className="font-medium text-gray-900">{user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FiMail className="text-gray-400 text-xl" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    {(user.first_name || user.last_name) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.first_name && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">First Name</p>
                            <p className="font-medium text-gray-900">{user.first_name}</p>
                          </div>
                        )}
                        {user.last_name && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Last Name</p>
                            <p className="font-medium text-gray-900">{user.last_name}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiPackage className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
                    <button
                      onClick={() => window.location.href = "/products"}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                            {order.status && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-gray-400" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                          View Details
                        </button>
                      </div>
                    ))}
                    
                    {orders.length > 5 && (
                      <div className="text-center pt-4">
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                          View All Orders ({orders.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                    <p className="text-gray-600 text-sm mb-4">Manage how you receive notifications</p>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      Configure Notifications
                    </button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Privacy & Security</h3>
                    <p className="text-gray-600 text-sm mb-4">Manage your privacy and security settings</p>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      Privacy Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;