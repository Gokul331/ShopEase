import React, { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiShoppingBag,
  FiCalendar,
  FiDollarSign,
  FiChevronRight,
  FiSearch
} from "react-icons/fi";

const Orders = () => {
  const { orders, loadOrders } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const initializeOrders = async () => {
      setLoading(true);
      await loadOrders();
      setLoading(false);
    };
    initializeOrders();
  }, []);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { icon: FiClock, color: "text-yellow-600", bgColor: "bg-yellow-100", label: "Pending" },
      processing: { icon: FiPackage, color: "text-blue-600", bgColor: "bg-blue-100", label: "Processing" },
      shipped: { icon: FiTruck, color: "text-purple-600", bgColor: "bg-purple-100", label: "Shipped" },
      delivered: { icon: FiCheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Delivered" },
      cancelled: { icon: FiAlertCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Cancelled" }
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) || 
                         order.items?.some(item => 
                           item.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product_title?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === "all" || 
                         order.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiPackage className="text-xl sm:text-2xl text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Loading Your Orders</h2>
            <p className="text-sm sm:text-base text-gray-600">We're fetching your order history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-xl sm:text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Your Orders</h1>
              <p className="text-xs sm:text-sm text-gray-600">Track and manage your purchases</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
                </div>
                <FiShoppingBag className="text-lg sm:text-xl text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {orders?.filter(o => o.status?.toLowerCase() === 'pending').length || 0}
                  </p>
                </div>
                <FiClock className="text-lg sm:text-xl text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {orders?.filter(o => o.status?.toLowerCase() === 'processing').length || 0}
                  </p>
                </div>
                <FiPackage className="text-lg sm:text-xl text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {orders?.filter(o => o.status?.toLowerCase() === 'delivered').length || 0}
                  </p>
                </div>
                <FiCheckCircle className="text-lg sm:text-xl text-green-600" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              <input
                type="text"
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {!orders || orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiPackage className="text-xl sm:text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start shopping to see your orders here</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Start Shopping
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiSearch className="text-xl sm:text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${statusInfo.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className={`text-lg sm:text-xl ${statusInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            Order #{order.id}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="text-gray-400 text-xs sm:text-sm" />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiDollarSign className="text-gray-400 text-xs sm:text-sm" />
                              <span>${parseFloat(order.total_amount || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <FiChevronRight className="text-gray-400 text-base sm:text-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.product?.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FiPackage className="text-gray-400 text-sm sm:text-base" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {item.product?.title || item.product_title || "Unknown Product"}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.items && order.items.length > 2 && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <p className="text-xs sm:text-sm text-gray-600">
                          +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium text-center">
                        View Details
                      </button>
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium text-center">
                        Track Order
                      </button>
                      {order.status?.toLowerCase() === 'delivered' && (
                        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium text-center">
                          Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More (if pagination is implemented) */}
        {filteredOrders && filteredOrders.length > 0 && (
          <div className="text-center mt-6 sm:mt-8">
            <button className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base">
              Load More Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;