import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI, cardAPI } from "../services/api";
import {
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiLock,
  FiCheck,
  FiArrowLeft,
  FiShield,
  FiCalendar,
  FiUser,
} from "react-icons/fi";

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    upiId: "",
    phonepeNumber: "",
    paytmNumber: "",
    gpayNumber: "",
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.retrieve(orderId);
      setOrder(response.data);
    } catch (err) {
      setError("Failed to load order details");
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCards = async () => {
      try {
        const res = await cardAPI.list();
        setSavedCards(res.data || []);
        const def = (res.data || []).find((c) => c.is_default);
        if (def) setSelectedCardId(def.id);
      } catch (e) {
        // ignore
      }
    };
    loadCards();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? "/" + v.substring(2, 4) : "");
    }
    return value;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // If user selected a saved card, use it for payment (simulate server-side charge)
      if (selectedCardId) {
        // In a real app we'd send the card token to the backend to charge. Here we simulate success.
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } else {
        // Simulate payment processing for new card
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Navigate to success page
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      setError("Payment processing failed. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: FiCreditCard,
      color: "blue",
    },
    { id: "upi", name: "UPI", icon: FiSmartphone, color: "purple" },
    { id: "gpay", name: "Google Pay", icon: FiSmartphone, color: "blue" },
    { id: "phonepe", name: "PhonePe", icon: FiSmartphone, color: "purple" },
    { id: "paytm", name: "PayTM", icon: FiSmartphone, color: "blue" },
    { id: "cod", name: "Cash on Delivery", icon: FiDollarSign, color: "green" },
  ];

  const getPaymentIcon = (methodId) => {
    return (
      paymentMethods.find((method) => method.id === methodId)?.icon ||
      FiCreditCard
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading payment details...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCreditCard className="text-2xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Payment Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Order not found
          </h2>
        </div>
      </div>
    );
  }

  const orderTotal = parseFloat(order.total_amount || 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="text-lg" />
            Back to Checkout
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Secure Payment
          </h1>
          <p className="text-gray-600">
            Complete your purchase with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods & Form */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiCreditCard className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>
                  <p className="text-gray-600">Choose how you want to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        paymentMethod === method.id
                          ? `border-${method.color}-500 bg-${method.color}-50`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-${method.color}-100 rounded-lg flex items-center justify-center`}
                        >
                          <Icon
                            className={`text-${method.color}-600 text-lg`}
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                          <FiCheck className="text-sm" />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    {/* Saved cards */}
                    {savedCards.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Use a saved card
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {savedCards.map((card) => (
                            <label
                              key={card.id}
                              className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer ${
                                selectedCardId === card.id
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div>
                                <div className="font-medium">
                                  {card.cardholder_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  **** **** **** {card.last4} • Exp{" "}
                                  {card.exp_month}/{card.exp_year} •{" "}
                                  {card.brand}
                                </div>
                              </div>
                              <input
                                type="radio"
                                name="savedCard"
                                checked={selectedCardId === card.id}
                                onChange={() => setSelectedCardId(card.id)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={(e) =>
                            handleInputChange("cardName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "cardNumber",
                              formatCardNumber(e.target.value)
                            )
                          }
                          maxLength={19}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              handleInputChange(
                                "expiryDate",
                                formatExpiryDate(e.target.value)
                              )
                            }
                            maxLength={5}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) =>
                              handleInputChange(
                                "cvv",
                                e.target.value.replace(/\D/g, "").slice(0, 3)
                              )
                            }
                            maxLength={3}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="username@upi"
                      value={formData.upiId}
                      onChange={(e) =>
                        handleInputChange("upiId", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {(paymentMethod === "gpay" ||
                  paymentMethod === "phonepe" ||
                  paymentMethod === "paytm") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData[`${paymentMethod}Number`]}
                      onChange={(e) =>
                        handleInputChange(
                          `${paymentMethod}Number`,
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      You'll be redirected to {paymentMethod.toUpperCase()} to
                      complete your payment
                    </p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FiDollarSign className="text-yellow-600 text-xl" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">
                          Cash on Delivery
                        </h4>
                        <p className="text-yellow-700 text-sm">
                          Pay when you receive your order. An additional ₹20 may
                          be charged for COD orders.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FiLock className="text-lg" />
                      Pay ${orderTotal}
                      <FiCreditCard className="text-lg" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                <FiShield className="text-green-500" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3 border-b border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FiCreditCard className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.title ||
                          item.product_title ||
                          "Unknown Product"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        $
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${orderTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>$5.99</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${(orderTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">
                      $
                      {(
                        parseFloat(orderTotal) +
                        5.99 +
                        orderTotal * 0.08
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Order Information
              </h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">
                    {order.items?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">
                    {paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
