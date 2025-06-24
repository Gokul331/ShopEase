import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Heart } from "react-feather";
import { getWishlist, removeFromWishlist } from "../utils/wishlistStorage";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const handleRemove = (id) => {
    removeFromWishlist(id);
    setWishlist(getWishlist());
  };

  return (
    <section className="py-12 bg-gray-50 min-h-[80vh] pt-28">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="text-pink-500" size={28} />
          <h2 className="text-3xl font-extrabold text-gray-900">My Wishlist</h2>
        </div>
        {wishlist.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center justify-center min-h-[20vh]">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              Your wishlist is empty
            </h3>
            <p className="mb-6 text-gray-500">
              Start adding products you love!
            </p>
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center relative"
              >
                <button
                  className="absolute top-3 right-3 bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200 transition"
                  onClick={() => handleRemove(product.id)}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-28 h-28 object-cover rounded-lg mb-4"
                  loading="lazy"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-indigo-600 font-bold text-xl">
                    ₹{product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through text-base">
                      ₹{product.oldPrice}
                    </span>
                  )}
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mt-auto"
                  title="View Product"
                >
                  <ShoppingCart size={16} />
                  View Product
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;