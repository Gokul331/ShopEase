import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
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
  FiHeart,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

const CheckoutPage = () => {
  const {
    cart,
    placeOrder,
    addresses,
    addAddress,
    editAddress,
    removeAddress,
    loading: storeLoading,
  } = useStore();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: "",
    is_default: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let formattedAddress;

      if (selectedAddressId && selectedAddressId !== "new") {
        const selected = addresses.find((a) => a.id === selectedAddressId);
        if (selected) {
          formattedAddress = `${selected.label || "Address"}\n${
            selected.line1
          }${selected.line2 ? `, ${selected.line2}` : ""}\n${selected.city}, ${
            selected.state
          } ${selected.postal_code}\n${selected.country}\nPhone: ${
            selected.phone || ""
          }`;
        }
      } else {
        // Validate new address form
        if (
          !formData.line1.trim() ||
          !formData.city.trim() ||
          !formData.state.trim() ||
          !formData.postal_code.trim()
        ) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }

        formattedAddress = `${formData.label || "Address"}\n${formData.line1}${
          formData.line2 ? `, ${formData.line2}` : ""
        }\n${formData.city}, ${formData.state} ${formData.postal_code}\n${
          formData.country
        }\nPhone: ${formData.phone || ""}`;
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

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.line1.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.postal_code.trim()
      ) {
        setError(
          "Please fill in all required fields (Street Address, City, State, and ZIP Code)."
        );
        setLoading(false);
        return;
      }

      const addressData = {
        label: formData.label || "Home",
        line1: formData.line1,
        line2: formData.line2 || "",
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        phone: formData.phone || "",
        is_default: addresses.length === 0 || formData.is_default,
      };

      console.log("Saving address:", addressData);

      if (editingAddress) {
        // Editing existing address
        await editAddress(editingAddress.id, addressData);
      } else {
        // Adding new address
        await addAddress(addressData);
      }

      // Reset form and show address selection
      resetForm();
      setShowAddressForm(false);

      // Show success message
      setError(null);
    } catch (err) {
      console.error("Address save error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save address. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      await removeAddress(addressId);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      setError("Failed to delete address. Please try again.");
      console.error("Address delete error:", err);
    }
  };

  const startEditingAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "US",
      phone: address.phone || "",
      is_default: address.is_default || false,
    });
    setShowAddressForm(true);
    setSelectedAddressId(null);
  };

  const startAddingNewAddress = () => {
    setEditingAddress(null);
    resetForm();
    setShowAddressForm(true);
    setSelectedAddressId("new");
  };

  const resetForm = () => {
    setFormData({
      label: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
      phone: "",
      is_default: false,
    });
    setEditingAddress(null);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    resetForm();
    setSelectedAddressId(null);
  };

  // Set default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId && !showAddressForm) {
      const defaultAddress =
        addresses.find((addr) => addr.is_default) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId, showAddressForm]);

  // Show address form if no addresses exist
  useEffect(() => {
    if (addresses.length === 0 && !showAddressForm) {
      setShowAddressForm(true);
      setSelectedAddressId("new");
    }
  }, [addresses.length, showAddressForm]);

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
        <div className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/20">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
            <FiPackage className="text-3xl sm:text-4xl text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-slate-600 mb-6 sm:mb-8 text-base sm:text-lg">
            Discover amazing products and add them to your cart.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <FiArrowLeft className="text-lg sm:text-xl" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-3 mb-4 sm:mb-6">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-2 shadow-lg border border-white/20 hover:shadow-xl text-sm sm:text-base"
            >
              <FiArrowLeft className="text-base sm:text-lg" />
              Back to Cart
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Secure Checkout
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Complete your purchase with fast, secure checkout
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-16 px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 sm:top-4 left-0 right-0 h-1 bg-slate-200 -z-10 mx-12 sm:mx-20" />
            <div
              className="absolute top-3 sm:top-4 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 -z-10 mx-12 sm:mx-20 transition-all duration-500"
              style={{
                width:
                  activeStep === 1 ? "33%" : activeStep === 2 ? "66%" : "100%",
              }}
            />

            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    activeStep >= step
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 transform scale-110"
                      : "bg-white text-slate-400 border-2 border-slate-200 shadow-lg"
                  } font-semibold text-sm sm:text-base md:text-lg`}
                >
                  {activeStep > step ? (
                    <FiCheck className="text-sm sm:text-base md:text-xl" />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium mt-2 sm:mt-3 ${
                    activeStep >= step ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {step === 1 ? "Shipping" : step === 2 ? "Payment" : "Confirm"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Left Column - Shipping Form */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Mobile Order Summary Toggle */}
            <div className="xl:hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
              <button
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Order Summary
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}{" "}
                    • ${finalTotal.toFixed(2)}
                  </p>
                </div>
                {showOrderSummary ? (
                  <FiChevronUp className="text-slate-400 text-xl" />
                ) : (
                  <FiChevronDown className="text-slate-400 text-xl" />
                )}
              </button>

              {showOrderSummary && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cart.items.map((item) => {
                      const price = Number(item.product?.price) || 0;
                      const quantity = Number(item.quantity) || 0;
                      const itemTotal = price * quantity;

                      return (
                        <div key={item.id} className="flex gap-3 py-2">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiPackage className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 text-sm leading-tight">
                              {item.product?.title || "Unknown Product"}
                            </h4>
                            <p className="text-slate-500 text-xs">
                              Qty: {quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900 text-sm">
                              ${itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiTruck className="text-blue-600 text-lg sm:text-xl md:text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Delivery Information
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              {error && (
                <div
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex items-center gap-3 text-sm sm:text-base ${
                    error.includes("Failed")
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-green-50 border border-green-200 text-green-700"
                  }`}
                >
                  <FiShield
                    className={`text-base sm:text-lg flex-shrink-0 ${
                      error.includes("Failed")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  />
                  {error}
                </div>
              )}

              {/* Address Selection or Form */}
              {!showAddressForm ? (
                <div>
                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <label className="block text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
                        🏠 Saved Addresses
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all duration-200 ${
                              selectedAddressId === addr.id
                                ? "border-indigo-500 bg-indigo-50/50 shadow-lg"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <label className="flex items-start gap-3 sm:gap-4 cursor-pointer flex-1">
                                <input
                                  type="radio"
                                  name="savedAddress"
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => setSelectedAddressId(addr.id)}
                                  className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="font-semibold text-slate-800 text-sm sm:text-base">
                                      {addr.label || "My Address"}
                                    </div>
                                    {addr.is_default && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-slate-600 text-sm leading-relaxed">
                                    {addr.line1}
                                    {addr.line2 ? `, ${addr.line2}` : ""}
                                    <br />
                                    {addr.city}, {addr.state} {addr.postal_code}
                                    {addr.country &&
                                      addr.country !== "US" &&
                                      `, ${addr.country}`}
                                  </div>
                                  {addr.phone && (
                                    <div className="text-slate-500 text-sm mt-1">
                                      📞 {addr.phone}
                                    </div>
                                  )}
                                </div>
                              </label>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => startEditingAddress(addr)}
                                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                  title="Edit address"
                                >
                                  <FiEdit className="text-lg" />
                                </button>
                                {addresses.length > 1 && (
                                  <button
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                    title="Delete address"
                                  >
                                    <FiTrash2 className="text-lg" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Address Button */}
                  <div className="border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200">
                    <button
                      onClick={startAddingNewAddress}
                      className="w-full flex flex-col items-center justify-center gap-2 sm:gap-3 text-slate-600 hover:text-indigo-600 transition-colors py-4"
                    >
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiPlus className="text-indigo-600 text-xl" />
                      </div>
                      <span className="font-semibold text-lg">
                        Add New Address
                      </span>
                      <span className="text-sm">
                        Create a new delivery address
                      </span>
                    </button>
                  </div>

                  {/* Continue to Payment Button */}
                  {addresses.length > 0 && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !selectedAddressId}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-6"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-white border-solid rounded-full animate-spin" />
                          <span className="text-sm sm:text-base">
                            Processing...
                          </span>
                        </>
                      ) : (
                        <>
                          <FiLock className="text-lg sm:text-xl" />
                          <span className="text-sm sm:text-base">
                            Continue to Payment
                          </span>
                          <FiCreditCard className="text-lg sm:text-xl" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                /* Address Form */
                <form onSubmit={handleSaveAddress}>
                  <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                      {editingAddress ? "Edit Address" : "Add New Address"}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {editingAddress
                        ? "Update your delivery address"
                        : "Enter your complete delivery address"}
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Label Field */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Address Label (Optional)
                      </label>
                      <input
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                        placeholder="Home, Work, etc."
                      />
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Street Address *
                      </label>
                      <div className="relative">
                        <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-base sm:text-lg" />
                        <input
                          type="text"
                          name="line1"
                          value={formData.line1}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                          placeholder="123 Main Street"
                        />
                      </div>
                    </div>

                    {/* Apartment/Suite */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Apartment, Suite, etc. (Optional)
                      </label>
                      <input
                        type="text"
                        name="line2"
                        value={formData.line2}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                        placeholder="Apt 4B, Floor 3"
                      />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          City *
                        </label>
                        <div className="relative">
                          <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-base sm:text-lg" />
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                            placeholder="New York"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                          placeholder="NY"
                        />
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    {/* Country and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          {/* Add more countries as needed */}
                        </select>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-base sm:text-lg" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Default Address Checkbox */}
                    {addresses.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <input
                          type="checkbox"
                          name="is_default"
                          checked={formData.is_default}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="text-sm font-medium text-slate-700">
                          Set as default address
                        </label>
                      </div>
                    )}

                    <div className="flex gap-3 sm:gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin" />
                            <span>Saving...</span>
                          </div>
                        ) : editingAddress ? (
                          "Update Address"
                        ) : (
                          "Save Address"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelAddressForm}
                        disabled={loading}
                        className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-sm sm:text-base hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Security & Trust Badges */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3">
                  <FiShield className="text-green-500 text-xl sm:text-2xl" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    SSL Secure
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3">
                  <FiLock className="text-blue-500 text-xl sm:text-2xl" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    Encrypted
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3">
                  <FiClock className="text-orange-500 text-xl sm:text-2xl" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    Fast Checkout
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3">
                  <FiHeart className="text-red-500 text-xl sm:text-2xl" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary (Desktop) */}
          <div className="hidden xl:block space-y-6">
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
                    {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}
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
                        <p className="text-slate-500 text-xs">
                          Qty: {quantity}
                        </p>
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
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
