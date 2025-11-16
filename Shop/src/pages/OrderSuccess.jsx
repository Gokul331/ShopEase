import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import { getProductImage } from "../utils/imageUtils";
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiHome,
  FiShoppingBag,
  FiArrowRight,
  FiDownload,
  FiShare2,
  FiClock,
  FiMail,
  FiUser,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await orderAPI.retrieve(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) loadOrder();
  }, [orderId]);

  // Safe number conversion helper
  const safeNumber = (value, fallback = 0) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  // Safe price formatting
  const formatPrice = (price) => {
    const numPrice = safeNumber(price);
    return numPrice.toFixed(2);
  };

  // Calculate item total safely
  const calculateItemTotal = (item) => {
    const price = safeNumber(item.price);
    const quantity = safeNumber(item.quantity, 1);
    return price * quantity;
  };

  // Calculate order total safely
  const calculateOrderTotal = (orderItems) => {
    if (!orderItems || !Array.isArray(orderItems)) return 0;
    return orderItems.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  const handleShareOrder = async () => {
    if (order) {
      const orderText = `Check out my order #${order.id} from YourStore!`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Order #${order.id}`,
            text: orderText,
            url: window.location.href,
          });
        } catch (err) {
          console.log("Error sharing:", err);
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${orderText} ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Parse shipping address into readable format
  const parseShippingAddress = (address) => {
    if (!address) return "No address provided";

    try {
      // If address is a string with newlines, split it
      if (typeof address === "string" && address.includes("\n")) {
        const lines = address.split("\n").filter((line) => line.trim());
        return (
          <div className="space-y-1">
            {lines.map((line, index) => (
              <div key={index} className={index === 0 ? "font-medium" : ""}>
                {line}
              </div>
            ))}
          </div>
        );
      }

      // If it's a simple string
      return <div>{address}</div>;
    } catch (err) {
      return <div>{address}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Loading your order details...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiPackage className="text-xl sm:text-2xl text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            View Your Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Order not found
          </h2>
        </div>
      </div>
    );
  }

  const orderTotal = calculateOrderTotal(order.items);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FiCheckCircle className="text-3xl sm:text-4xl md:text-5xl text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Order Confirmed!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2 px-4">
            Thank you for your purchase, we're getting your order ready.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm sm:text-base">
            <FiClock className="text-sm sm:text-lg" />
            <span>
              Order placed on {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="text-lg sm:text-xl md:text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Order Summary
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Order #{order.id}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 sm:space-y-4">
                {order.items &&
                  order.items.map((item) => {
                    const itemTotal = calculateItemTotal(item);
                    const itemPrice = safeNumber(item.price);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getProductImage(item.product) ? (
                            <img
                              src={getProductImage(item.product)}
                              alt={item.product.title}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center ${
                              getProductImage(item.product) ? "hidden" : "flex"
                            }`}
                          >
                            <FiPackage className="text-gray-400 text-sm" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {item.product?.title ||
                              item.product_title ||
                              "Unknown Product"}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Quantity: {safeNumber(item.quantity, 1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            ${formatPrice(itemTotal)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            ${formatPrice(itemPrice)} each
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Order Total */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                  <span className="text-gray-900">Order Total</span>
                  <span className="text-green-600">
                    ${formatPrice(orderTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiHome className="text-lg sm:text-xl md:text-2xl text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Shipping Information
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Where your order is headed
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-gray-700 text-sm sm:text-base">
                  {parseShippingAddress(order.shipping_address)}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Next Steps */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                What's Next?
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                    <FiMail className="text-blue-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      Order Confirmation
                    </p>
                    <p className="text-gray-600 text-xs">Sent to your email</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                    <FiPackage className="text-green-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      Order Processing
                    </p>
                    <p className="text-gray-600 text-xs">
                      We're preparing your items
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                    <FiTruck className="text-purple-600 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      Estimated Delivery
                    </p>
                    <p className="text-gray-600 text-xs">
                      {getEstimatedDelivery()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Order Actions
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full flex items-center justify-between gap-2 sm:gap-3 bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm group"
                >
                  <span>View All Orders</span>
                  <FiArrowRight className="text-sm sm:text-lg group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleShareOrder}
                  className="w-full flex items-center justify-between gap-2 sm:gap-3 border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
                >
                  <span>{copied ? "Copied!" : "Share Order"}</span>
                  <FiShare2 className="text-sm sm:text-lg" />
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-between gap-2 sm:gap-3 border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
                >
                  <span>Continue Shopping</span>
                  <FiShoppingBag className="text-sm sm:text-lg" />
                </button>

                <button className="w-full flex items-center justify-between gap-2 sm:gap-3 border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm">
                  <span>Download Receipt</span>
                  <FiDownload className="text-sm sm:text-lg" />
                </button>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
              <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-2">
                Need Help?
              </h3>
              <p className="text-blue-700 text-xs sm:text-sm mb-2 sm:mb-3">
                Our support team is here to help with your order.
              </p>
              <div className="text-blue-600 text-xs sm:text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <FiMail className="text-xs" />
                  <span>support@yourstore.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-xs" />
                  <span>+1 (800) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Progress */}
        <div className="mt-8 sm:mt-12 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
            Order Status
          </h3>
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {["Ordered", "Confirmed", "Shipped", "Delivered"].map(
              (step, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm ${
                      index === 0
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index === 0 ? (
                      <FiCheckCircle className="text-sm sm:text-base" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm mt-1 sm:mt-2 text-center px-1 ${
                      index === 0
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-sm"
          >
            <FiArrowRight className="text-sm" />
            View Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium text-sm ml-2"
          >
            <FiShoppingBag className="text-sm" />
            Shop More
          </button>
        </div>

        {/* Add padding for mobile bottom actions */}
        <div className="lg:hidden pb-20"></div>
      </div>
    </div>
  );
};

export default OrderSuccess;
