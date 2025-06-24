import React, { useEffect, useState } from "react";
import { Trash2, Plus, Minus, Heart, Star } from "react-feather";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../utils/cartStorage";
import {
  getWishlist,
  addToWishlist,
  isInWishlist,
} from "../utils/wishlistStorage";
import { Link } from "react-router-dom";

const userAddress = {
  name: "John Doe",
  address: "123 Main Street, Mumbai, Maharashtra, 400001",
  phone: "+91 9876543210",
};

const platformFee = 49;

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = (id) => {
    removeFromCart(id);
    setCart(getCart());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleQuantity = (id, qty) => {
    if (qty < 1) return;
    updateCartQuantity(id, qty);
    setCart(getCart());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleClear = () => {
    clearCart();
    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Save for Later handler
  const handleSaveForLater = (item) => {
    if (!isInWishlist(item.id)) {
      addToWishlist(item);
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
    removeFromCart(item.id);
    setCart(getCart());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Calculate totals
  const price = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const oldPrice = cart.reduce(
    (sum, item) =>
      sum +
      (item.oldPrice
        ? item.oldPrice * (item.quantity || 1)
        : item.price * (item.quantity || 1)),
    0
  );
  const discount = oldPrice - price;
  const total = price + (cart.length > 0 ? platformFee : 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="mb-6 text-gray-500">Add some products to your cart!</p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 pt-28 min-h-[79vh]">
      {/* Address */}
      <div className="bg-white rounded-xl shadow p-4 mb-8 flex items-center justify-between">
        <div>
          <div className="font-bold text-lg mb-1">Deliver to:</div>
          <div className="font-semibold">{userAddress.name}</div>
          <div className="text-gray-700">{userAddress.address}</div>
          <div className="text-gray-500 text-sm">{userAddress.phone}</div>
        </div>
        <button className="text-indigo-600 hover:underline font-semibold">
          Change
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow p-4 gap-6 relative"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1 w-full">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                {/* Ratings */}
                {item.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({item.reviews || 0})
                    </span>
                  </div>
                )}
                {/* Discount */}
                {item.discount && (
                  <div className="text-green-600 text-sm font-semibold mt-1">
                    {item.discount}% OFF
                  </div>
                )}
                {/* Delivery Date */}
                <div className="text-sm text-gray-500 mt-1">
                  Delivery by:{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(
                      Date.now() + 3 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {/* Price */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-indigo-600 font-bold text-lg">
                    ₹{item.price}
                  </span>
                  {item.oldPrice && (
                    <span className="text-gray-400 line-through text-base">
                      ₹{item.oldPrice}
                    </span>
                  )}
                </div>
                {/* Quantity */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleQuantity(item.id, item.quantity - 1)}
                    className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantity(item.id, item.quantity + 1)}
                    className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                  <button
                    onClick={() => handleSaveForLater(item)}
                    className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                  >
                    <Heart size={16} />
                    Save for Later
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                    Buy This Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Details */}
        <div className="w-full lg:w-80 bg-white rounded-xl shadow p-6 h-fit">
          <div className="font-bold text-lg mb-4">Price Details</div>
          <div className="flex justify-between mb-2">
            <span>Price ({cart.length} items)</span>
            <span>₹{oldPrice}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Discount</span>
            <span className="text-green-600">-₹{discount}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Platform Fee</span>
            <span>₹{platformFee}</span>
          </div>
          <div className="border-t my-3"></div>
          <div className="flex justify-between font-bold text-lg mb-2">
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>
          <div className="text-green-600 text-sm mb-4">
            You will save ₹{discount} on this order
          </div>
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition text-lg">
            Place Order &nbsp; ₹{total}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
