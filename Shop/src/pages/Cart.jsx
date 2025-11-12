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
  FiArrowRight,
  FiHeart,
  FiShare2,
} from "react-icons/fi";

const Cart = () => {
  const {
    cart,
    cartItems,
    removeFromCart,
    updateQty,
    placeOrder,
    clearCart,
    addToWishlist,
  } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  const items = cartItems || [];

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) =>
      total + parseFloat(item.product?.price || 0) * (item.quantity || 1),
    0
  );

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQty(itemId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId, productTitle) => {
    setRemovingItem(itemId);
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      alert("Please log in to add items to wishlist");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    try {
      await addToWishlist(product.id);
      alert(`"${product.title}" added to wishlist!`);
      // Optionally remove from cart after adding to wishlist
      // await removeFromCart(item.id);
    } catch (error) {
      alert("Failed to add item to wishlist");
      console.error("Add to wishlist error:", error);
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

    navigate("/checkout");
  };

  const continueShopping = () => {
    navigate("/products");
  };

  const clearAllItems = () => {
    if (window.confirm("Remove all items from cart?")) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiShoppingCart className="text-gray-400 text-2xl sm:text-3xl" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4 sm:px-0">
              Looks like you haven't added any items to your cart yet. Start
              shopping to discover amazing products!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={continueShopping}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
              >
                <FiArrowRight className="text-lg" />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/trending")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
              >
                <FiHeart className="text-lg" />
                View Trending
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header - Enhanced Responsive Layout */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          {/* Left side - Back + Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1 sm:p-2 text-gray-600 hover:text-indigo-600 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <FiArrowLeft className="text-lg sm:text-xl" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Cart
                <span className="sm:hidden text-gray-600 font-normal">
                  {" "}
                  ({items.length})
                </span>
              </h1>

              <span className="hidden sm:flex bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={clearAllItems}
              className="hidden xs:block text-red-600 hover:text-red-700 font-medium text-sm whitespace-nowrap"
            >
              Clear All
            </button>

            {/* Mobile clear button */}
            <button
              onClick={clearAllItems}
              className="xs:hidden text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear all"
            >
              <FiTrash2 className="text-base" />
            </button>

            <button
              onClick={continueShopping}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap"
            >
              <FiArrowRight className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Continue</span>
              <span className="sm:hidden">Shop</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile Summary Bar */}
              <div className="lg:hidden p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Total ({items.length} items):
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {items.map((item) => (
                <div className="flex flex-col">
                  <div
                    key={item.id}
                    className="flex justify-between sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-100 last:border-b-0 group relative"
                  >
                    {/* Loading overlay for remove action */}
                    {removingItem === item.id && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-end justify-center z-10 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                    {/* Left side */}
                    <div className="flex-col items-center">
                      {/* Product Image */}
                      <div
                        className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() =>
                          navigate(`/products/${item.product?.id}`)
                        }
                      >
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FiShoppingCart className="text-gray-400 text-lg" />
                        )}
                      </div>
                      {/* Mobile-only actions */}
                      <div className="place-self-center flex items-center gap-3 mt-2 sm:hidden">
                        <button
                          onClick={() => handleAddToWishlist(item.product)}
                          className="text-gray-400 hover:text-pink-600 transition-colors"
                          title="Save for later"
                        >
                          <FiHeart className="text-base" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.id, item.product?.title)
                          }
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </div>
                    {/* Right Side */}
                    <div className="text-right">
                      {/* Product Info */}
                      <div className="flex-1 min-w-0 ">
                        <h3
                          className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors"
                          onClick={() =>
                            navigate(`/products/${item.product?.id}`)
                          }
                        >
                          {item.product?.title || "Unknown Product"}
                        </h3>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">
                          ${parseFloat(item.product?.price || 0).toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {item.product?.in_stock ? "In stock" : "Out of stock"}{" "}
                          • Free shipping
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Quantity Controls and Price */}
                  <div className="flex items-center px-3 py-2 justify-between sm:justify-end gap-3 sm:gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg px-2 sm:px-3 py-1">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus className="text-xs sm:text-sm" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-gray-900 text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="p-1 text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        <FiPlus className="text-xs sm:text-sm" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-16 sm:min-w-20">
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        $
                        {(
                          parseFloat(item.product?.price || 0) * item.quantity
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 sm:hidden">
                        ${parseFloat(item.product?.price || 0).toFixed(2)} each
                      </p>
                    </div>

                    {/* Remove Button - Desktop only */}
                    <div className="hidden sm:flex items-center gap-2">
                      <button
                        onClick={() => handleAddToWishlist(item.product)}
                        className="p-2 text-gray-400 hover:text-pink-600 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Save for later"
                      >
                        <FiHeart className="text-base" />
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveItem(item.id, item.product?.title)
                        }
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove item"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges - Mobile */}
            <div className="lg:hidden mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-lg">🚚</div>
                <p className="text-xs text-gray-600 mt-1">Free Shipping</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-lg">🔒</div>
                <p className="text-xs text-gray-600 mt-1">Secure Checkout</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-lg">↩️</div>
                <p className="text-xs text-gray-600 mt-1">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4 sm:top-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Order Summary
              </h3>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between font-bold text-gray-900 text-base sm:text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 50 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAlertCircle className="text-blue-600 text-sm" />
                    <span className="text-xs sm:text-sm font-medium text-blue-800">
                      Add ${(50 - subtotal).toFixed(2)} for FREE shipping!
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
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
                className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="text-lg sm:text-xl" />
                    Proceed to Checkout • ${total.toFixed(2)}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-3 sm:mt-4 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <span>🔒</span>
                  Secure checkout • Your data is protected
                </p>
              </div>

              {/* Trust Badges - Desktop */}
              <div className="hidden lg:block mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg">🚚</div>
                    <p className="text-xs text-gray-600 mt-1">Free Shipping</p>
                  </div>
                  <div>
                    <div className="text-lg">🔒</div>
                    <p className="text-xs text-gray-600 mt-1">Secure</p>
                  </div>
                  <div>
                    <div className="text-lg">↩️</div>
                    <p className="text-xs text-gray-600 mt-1">Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed / Recommendations Section */}
        <div className="mt-8 sm:mt-12">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              You might also like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Placeholder for recommended products */}
              <div className="text-center text-gray-500 text-sm py-8">
                Recommended products will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
