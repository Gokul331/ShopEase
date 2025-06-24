const WISHLIST_KEY = "shopease_wishlist";

// Get wishlist from localStorage
export function getWishlist() {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
}

// Add a product to wishlist
export function addToWishlist(product) {
  const wishlist = getWishlist();
  // Avoid duplicates by id
  if (!wishlist.find((item) => item.id === product.id)) {
    wishlist.push(product);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }
}

// Remove a product from wishlist by id
export function removeFromWishlist(productId) {
  const wishlist = getWishlist().filter((item) => item.id !== productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

// Check if a product is in wishlist
export function isInWishlist(productId) {
  return getWishlist().some((item) => item.id === productId);
}
