import React, { useState, useEffect } from "react";
import { productAPI, categoryAPI } from "../services/api";
import { useStore } from "../context/StoreContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const placeholderImage = (seed, w = 400, h = 300) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlistProducts,
    cartItems,
  } = useStore();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // if there's a category query param, set it
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);

    fetchCategories();
    fetchProducts();
  }, [selectedCategory, sortBy]);

  // Fetch categories for the filter dropdown
  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.list();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.list();
      let filteredProducts = response.data;

      if (selectedCategory) {
        // allow filtering by either id or slug
        filteredProducts = filteredProducts.filter((p) => {
          if (!p.category) return false;
          return (
            String(p.category.id) === String(selectedCategory) ||
            String(p.category.slug) === String(selectedCategory)
          );
        });
      }

      if (sortBy === "price_asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price_desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
      }

      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const success = await addToCart(productId, 1);
      if (success) {
        alert("Product added to cart successfully!");
      } else {
        alert("Failed to add product to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  const handleWishlistToggle = async (productId) => {
    try {
      if (!user) {
        // redirect to login for non-authenticated users
        navigate("/login", { state: { from: `/products?from=wishlist` } });
        return;
      }

      const isInWishlist = wishlistProducts.some((p) => p.id === productId);
      // call the correct function from store (extracted at top)
      const success = isInWishlist
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId);

      if (success) {
        // No alert needed - visual feedback is enough
      } else {
        alert(
          isInWishlist
            ? "Failed to remove from wishlist"
            : "Failed to add to wishlist"
        );
      }
    } catch (error) {
      console.error("Error managing wishlist:", error);
      alert("Failed to update wishlist");
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <div className="flex gap-4">
          <select
            className="border rounded p-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <Link to={`/products/${product.id}`}>
              <img
                src={product.image || placeholderImage(product.slug)}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/products/${product.id}`}>
                <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
              </Link>
              <p className="text-gray-600 text-sm mb-2">
                {product.category?.name}
              </p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">${product.price}</span>
                {product.discount_percentage > 0 && (
                  <span className="text-green-600 text-sm">
                    {product.discount_percentage}% OFF
                  </span>
                )}
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FiShoppingCart /> Add to Cart
                </button>
                <button
                  onClick={() => handleWishlistToggle(product.id)}
                  className={`px-4 py-2 border rounded hover:bg-gray-100 ${
                    wishlistProducts.some((p) => p.id === product.id)
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  <FiHeart />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default ProductList;
