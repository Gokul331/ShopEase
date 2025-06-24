import React from "react";
import { ShoppingCart } from "react-feather";

const Product = ({ title, image, price, oldPrice, onAddToCart }) => (
  <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center">
    <img
      src={image}
      alt={title}
      className="w-32 h-32 object-cover rounded-lg mb-4"
      loading="lazy"
    />
    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
      {title}
    </h3>
    <div className="flex items-center gap-2 mb-4">
      <span className="text-indigo-600 font-bold text-xl">₹{price}</span>
      {oldPrice && (
        <span className="text-gray-400 line-through text-base">
          ₹{oldPrice}
        </span>
      )}
    </div>
    <button
      onClick={onAddToCart}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
    >
      <ShoppingCart size={18} />
      Add to Cart
    </button>
  </div>
);

export default Product;
