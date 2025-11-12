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
  FiEdit,
  FiMapPin,
  FiHome,
  FiPhone,
  FiMail
} from "react-icons/fi";

// Custom Payment Icons
const PaymentIcons = {
  PhonePe: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#5F259F" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-1v-4h1v4zm5 0h-1v-4h1v4z"/>
    </svg>
  ),
  GooglePay: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  Paytm: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#002E6E" d="M20.45 5.78c-.63-.63-1.52-.78-2.28-.78H5.83c-.76 0-1.65.15-2.28.78-.63.63-.78 1.52-.78 2.28v7.88c0 .76.15 1.65.78 2.28.63.63 1.52.78 2.28.78h12.34c.76 0 1.65-.15 2.28-.78.63-.63.78-1.52.78-2.28V8.06c0-.76-.15-1.65-.78-2.28zm-1.41 10.16c0 .39-.16.55-.55.55H5.51c-.39 0-.55-.16-.55-.55V8.06c0-.39.16-.55.55-.55h12.98c.39 0 .55.16.55.55v7.88z"/>
      <path fill="#00BAF2" d="M12 9.14c-1.57 0-2.86 1.29-2.86 2.86s1.29 2.86 2.86 2.86 2.86-1.29 2.86-2.86-1.29-2.86-2.86-2.86z"/>
    </svg>
  ),
  UPI: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#0084FF" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  Card: FiCreditCard,
  COD: FiDollarSign
};

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
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    upiId: "",
    phonepeNumber: "",
    paytmNumber: "",
    gpayNumber: "",
    // Address fields
    fullName: "",
    email: "",
    shippingAddress: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.retrieve(orderId);
      setOrder(response.data);
      // Pre-fill address from order if available
      if (response.data.shipping_address) {
        const address = response.data.shipping_address;
        setFormData(prev => ({
          ...prev,
          fullName: address.full_name || "",
          shippingAddress: address.line1 || "",
          apartment: address.line2 || "",
          city: address.city || "",
          state: address.state || "",
          zipCode: address.postal_code || "",
          phone: address.phone || "",
          email: address.email || ""
        }));
      }
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
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } else {
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
      icon: PaymentIcons.Card,
      color: "blue",
    },
    { 
      id: "upi", 
      name: "UPI", 
      icon: PaymentIcons.UPI, 
      color: "purple" 
    },
    { 
      id: "gpay", 
      name: "Google Pay", 
      icon: PaymentIcons.GooglePay, 
      color: "blue" 
    },
    { 
      id: "phonepe", 
      name: "PhonePe", 
      icon: PaymentIcons.PhonePe, 
      color: "purple" 
    },
    { 
      id: "paytm", 
      name: "PayTM", 
      icon: PaymentIcons.Paytm, 
      color: "blue" 
    },
    { 
      id: "cod", 
      name: "Cash on Delivery", 
      icon: PaymentIcons.COD, 
      color: "green" 
    },
  ];

  const getPaymentIcon = (methodId) => {
    return paymentMethods.find((method) => method.id === methodId)?.icon || PaymentIcons.Card;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Loading payment details...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiCreditCard className="text-xl sm:text-2xl text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Payment Error
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Order not found
          </h2>
        </div>
      </div>
    );
  }

  const orderTotal = parseFloat(order.total_amount || 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <FiArrowLeft className="text-base sm:text-lg" />
            Back to Checkout
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Secure Payment
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete your purchase with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Payment Methods & Form */}
          <div className="space-y-4 sm:space-y-6">
            {/* Shipping Address Display */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FiMapPin className="text-green-600 text-sm sm:text-base" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Delivery Address
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Where your order will be delivered
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <FiEdit className="text-sm" />
                  <span className="hidden xs:inline">Edit</span>
                </button>
              </div>

              {!showAddressForm ? (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{formData.fullName || "Not provided"}</p>
                    <p>{formData.shippingAddress}</p>
                    {formData.apartment && <p>{formData.apartment}</p>}
                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                    {formData.phone && <p>📞 {formData.phone}</p>}
                    {formData.email && <p>📧 {formData.email}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="400001"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FiCreditCard className="text-blue-600 text-sm sm:text-base md:text-lg" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm">Choose how you want to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl text-left transition-all ${
                        paymentMethod === method.id
                          ? `border-${method.color}-500 bg-${method.color}-50`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-${method.color}-100 rounded flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`text-${method.color}-600 text-xs sm:text-sm`} />
                        </div>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">
                          {method.name}
                        </span>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                          <FiCheck className="text-xs" />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-3 sm:space-y-4">
                {paymentMethod === "card" && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Saved cards */}
                    {savedCards.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Use a saved card
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {savedCards.map((card) => (
                            <label
                              key={card.id}
                              className={`p-2 sm:p-3 border rounded-lg flex items-center justify-between cursor-pointer ${
                                selectedCardId === card.id
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div>
                                <div className="font-medium text-xs sm:text-sm">
                                  {card.cardholder_name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  **** **** **** {card.last4} • Exp {card.exp_month}/{card.exp_year}
                                </div>
                              </div>
                              <input
                                type="radio"
                                name="savedCard"
                                checked={selectedCardId === card.id}
                                onChange={() => setSelectedCardId(card.id)}
                                className="w-3 h-3 sm:w-4 sm:h-4"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={(e) =>
                            handleInputChange("cardName", e.target.value)
                          }
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
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
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
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
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
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
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="username@upi"
                      value={formData.upiId}
                      onChange={(e) =>
                        handleInputChange("upiId", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {(paymentMethod === "gpay" ||
                  paymentMethod === "phonepe" ||
                  paymentMethod === "paytm") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      You'll be redirected to {paymentMethod.toUpperCase()} to complete your payment
                    </p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="text-yellow-600 text-base" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 text-sm">
                          Cash on Delivery
                        </h4>
                        <p className="text-yellow-700 text-xs">
                          Pay when you receive your order. An additional ₹20 may be charged for COD orders.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FiLock className="text-base sm:text-lg" />
                      Pay ${orderTotal}
                      <FiCreditCard className="text-base sm:text-lg" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                <FiShield className="text-green-500 text-sm sm:text-base" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 overflow-y-auto pr-2">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 sm:py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FiCreditCard className="text-gray-400 text-sm sm:text-base" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs sm:text-sm">
                        {item.product?.title ||
                          item.product_title ||
                          "Unknown Product"}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                        $
                        {((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>${orderTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span>$5.99</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tax</span>
                  <span>${(orderTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
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
            <div className="bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
              <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-2 sm:mb-3">
                Order Information
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-700">
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