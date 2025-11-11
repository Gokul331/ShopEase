import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { addressAPI } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCreditCard,
  FiLock,
  FiCheck,
  FiHome,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiShield,
  FiClock,
  FiHeart
} from "react-icons/fi";

const CheckoutPage = () => {
  const { cart, placeOrder } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    shippingAddress: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (
        !formData.shippingAddress.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.zipCode.trim() ||
        !formData.phone.trim()
      ) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      let formattedAddress;
      if (selectedAddressId) {
        const selected = savedAddresses.find((a) => a.id === selectedAddressId);
        if (selected) {
          formattedAddress = `${selected.label ? selected.label + " - " : ""}${
            selected.line1
          }${selected.line2 ? ", " + selected.line2 : ""}\n${selected.city}, ${
            selected.state
          } ${selected.postal_code}\n${selected.country}\nPhone: ${
            selected.phone || ""
          }`;
        }
      }

      if (!formattedAddress) {
        formattedAddress = `${formData.fullName}\n${formData.shippingAddress}${
          formData.apartment ? `, ${formData.apartment}` : ""
        }\n${formData.city}, ${formData.state} ${formData.zipCode}\nPhone: ${
          formData.phone
        }`;
      }

      const order = await placeOrder(formattedAddress);

      if (order) {
        navigate(`/payment/${order.id}`);
      } else {
        setError("Failed to create order. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during checkout. Please try again.");
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await addressAPI.list();
        setSavedAddresses(res.data || []);
        const def = (res.data || []).find((a) => a.is_default);
        if (def) setSelectedAddressId(def.id);
      } catch (e) {
        // ignore silently
      }
    };
    loadAddresses();
  }, []);

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = Number(item.product?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const total = calculateTotal();
  const shipping = total > 50 ? 0 : 5.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <FiPackage className="text-4xl text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-slate-600 mb-8 text-lg">
            Discover amazing products and add them to your cart.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FiArrowLeft className="text-xl" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/20 hover:shadow-xl"
            >
              <FiArrowLeft className="text-lg" />
              Back to Cart
            </Link>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent mb-4">
            Secure Checkout
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Complete your purchase with fast, secure checkout
          </p>
        </div>

        {/* Progress Steps - Modern Design */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-10 mx-20" />
            <div className="absolute top-4 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 -z-10 mx-20 transition-all duration-500" 
                 style={{ width: activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%' }} />
            
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  activeStep >= step 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 transform scale-110' 
                    : 'bg-white text-slate-400 border-2 border-slate-200 shadow-lg'
                } font-semibold text-lg`}>
                  {activeStep > step ? <FiCheck className="text-xl" /> : step}
                </div>
                <span className={`text-sm font-medium mt-3 ${
                  activeStep >= step ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Confirm'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Shipping Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Shipping Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiTruck className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Delivery Information
                  </h2>
                  <p className="text-slate-600">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
                  <FiShield className="text-red-500 text-lg" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-slate-800 mb-4">
                      🏠 Saved Addresses
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`p-4 border-2 rounded-2xl flex items-start gap-4 cursor-pointer transition-all duration-200 ${
                            selectedAddressId === addr.id
                              ? "border-indigo-500 bg-indigo-50/50 shadow-lg"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800">
                              {addr.label || `${addr.line1}`}
                            </div>
                            <div className="text-slate-600 text-sm mt-1">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.postal_code}
                            </div>
                            {addr.phone && (
                              <div className="text-slate-500 text-sm mt-1">
                                📞 {addr.phone}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedAddressId(null)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mt-2 flex items-center gap-2 transition-colors"
                      >
                        + Add New Address
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Street Address *
                  </label>
                  <div className="relative">
                    <FiHome className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Apartment, Suite, etc. (Optional)
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Apt 4B, Floor 3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      City *
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="New York"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      pattern="[0-9]*"
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin" />
                      Processing Your Order...
                    </>
                  ) : (
                    <>
                      <FiLock className="text-xl" />
                      Continue to Payment
                      <FiCreditCard className="text-xl" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Security & Trust Badges */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-2 p-3">
                  <FiShield className="text-green-500 text-2xl" />
                  <span className="text-sm font-medium text-slate-700">SSL Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3">
                  <FiLock className="text-blue-500 text-2xl" />
                  <span className="text-sm font-medium text-slate-700">Encrypted</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3">
                  <FiClock className="text-orange-500 text-2xl" />
                  <span className="text-sm font-medium text-slate-700">Fast Checkout</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3">
                  <FiHeart className="text-red-500 text-2xl" />
                  <span className="text-sm font-medium text-slate-700">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 sticky top-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiPackage className="text-emerald-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Order Summary
                  </h2>
                  <p className="text-slate-600">
                    {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-2">
                {cart.items.map((item) => {
                  const price = Number(item.product?.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemTotal = price * quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiPackage className="text-slate-400 text-xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                          {item.product?.title || "Unknown Product"}
                        </h3>
                        <p className="text-slate-500 text-xs">Qty: {quantity}</p>
                        <p className="text-slate-600 font-medium text-sm mt-1">
                          ${price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                {total < 50 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-amber-700 text-sm font-medium">
                      Add ${(50 - total).toFixed(2)} for FREE shipping!
                    </p>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support & Guarantees */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl border border-blue-200 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <FiPhone className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">
                      Need Help?
                    </h3>
                    <p className="text-blue-700 text-sm mb-3 leading-relaxed">
                      Our support team is available 24/7 to assist you with any questions.
                    </p>
                    <div className="text-blue-600 font-semibold text-sm">
                      📞 +1 (800) 123-4567
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl border border-green-200 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <FiShield className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 mb-2">
                      Money Back Guarantee
                    </h3>
                    <p className="text-green-700 text-sm leading-relaxed">
                      30-day return policy. Love it or your money back.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;