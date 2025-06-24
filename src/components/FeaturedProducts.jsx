import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingCart, CheckCircle } from "react-feather";
import { Link } from "react-router-dom";
import { featuredProducts } from "../data/featuredProducts";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../utils/wishlistStorage";
import { addToCart, getCart } from "../utils/cartStorage";

const FeaturedProducts = () => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [animatingCartId, setAnimatingCartId] = useState(null);

  useEffect(() => {
    setWishlist(getWishlist());
    setCart(getCart());
  }, []);

  const handleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setWishlist(getWishlist());
    window.dispatchEvent(new Event("wishlistUpdated")); // For live update
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCart(getCart());
    setAnimatingCartId(product.id);
    window.dispatchEvent(new Event("cartUpdated")); // Notify navbar to update count
    setTimeout(() => setAnimatingCartId(null), 1000);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="block">Featured Products</span>
            <motion.span
              animate={{
                color: ["#6366f1", "#ec4899", "#6366f1"],
                transition: { duration: 8, repeat: Infinity },
              }}
              className="block text-indigo-600"
            >
              Best Sellers This Week
            </motion.span>
          </h2>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden group relative"
            >
              <Link to={`/product/${product.id}`}>
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                    src={product.image}
                    alt={product.title}
                  />
                  {/* Discount Badge */}
                  {product.discount && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md"
                    >
                      {product.discount}% OFF
                    </motion.div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center mb-3">
                    <span className="text-lg font-bold text-indigo-600">
                      ₹{product.price}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.oldPrice}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 1.05 }}
                      className={`px-4 py-2 text-white text-sm rounded-md flex items-center relative transition-colors duration-300 overflow-hidden ${
                        animatingCartId === product.id
                          ? "bg-green-500"
                          : "bg-indigo-600"
                      }`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      <motion.span
                        animate={
                          animatingCartId === product.id
                            ? {
                                x: 60,
                                color: "#22c55e",
                                scale: 1.3,
                                opacity: [1, 1, 0],
                              }
                            : { x: 0, color: "#fff", scale: 1, opacity: 1 }
                        }
                        transition={
                          animatingCartId === product.id
                            ? { duration: 1 }
                            : { duration: 0.2 }
                        }
                        className="flex items-center"
                        style={{ top: "50%" }}
                      >
                        {/* Changed icon: show CheckCircle when animating, else ShoppingCart */}
                        {animatingCartId === product.id ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <ShoppingCart className="w-5 h-5 " />
                        )}
                      </motion.span>
                      <motion.span
                        key={animatingCartId === product.id ? "added" : "add"}
                        initial={{ opacity: 1 }}
                        animate={{
                          opacity: 1,
                          x: animatingCartId === product.id ? -20 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="ml-7"
                      >
                        {animatingCartId === product.id
                          ? "Added"
                          : "Add to Cart"}
                      </motion.span>
                      
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 ${
                        isInWishlist(product.id)
                          ? "text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleWishlist(product);
                      }}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={isInWishlist(product.id) ? "#ef4444" : "none"}
                      />
                    </motion.button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
