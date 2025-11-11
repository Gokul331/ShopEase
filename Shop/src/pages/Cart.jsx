import React, { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiCreditCard,
  FiAlertCircle,
} from "react-icons/fi";

const Cart = () => {
  const { cart, cartItems, removeFromCart, updateQty, placeOrder, clearCart } =
    useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const items = cartItems || [];

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) =>
      total + parseFloat(item.product?.price || 0) * (item.quantity || 1),
    0
  );

  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQty(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId, productTitle) => {
    if (window.confirm(`Remove "${productTitle}" from cart?`)) {
      removeFromCart(itemId);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please log in to place an order");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Navigate to checkout page where user can add/edit address before payment
    navigate("/checkout");
  };

  const continueShopping = () => {
    navigate("/products");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              shopping to discover amazing products!
            </p>
            <button
              onClick={continueShopping}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <FiArrowLeft className="text-lg" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={continueShopping}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-6 border-b border-gray-100 last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FiShoppingCart className="text-gray-400 text-xl" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.product?.title || "Unknown Product"}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      ${parseFloat(item.product?.price || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      In stock • Free shipping
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus className="text-sm" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="p-1 text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        <FiPlus className="text-sm" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() =>
                        handleRemoveItem(item.id, item.product?.title)
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove item"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-20">
                    <p className="text-lg font-semibold text-gray-900">
                      $
                      {(
                        parseFloat(item.product?.price || 0) * item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 50 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAlertCircle className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Add ${(50 - subtotal).toFixed(2)} for FREE shipping!
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold text-lg"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="text-xl" />
                    Place Order • ${total.toFixed(2)}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure checkout • Your data is protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
