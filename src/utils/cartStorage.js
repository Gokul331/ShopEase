const CART_KEY = "shopease_cart";

// Get cart from localStorage
export function getCart() {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

// Add a product to cart (with quantity)
export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Remove a product from cart by id
export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Update quantity of a product in cart
export function updateCartQuantity(productId, quantity) {
  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Clear the cart
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
