import React, { createContext, useContext, useState, useEffect } from "react";
import { cartAPI, wishlistAPI, orderAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const [cartResponse, wishlistResponse] = await Promise.all([
        cartAPI.get(),
        wishlistAPI.get(),
      ]);
      // endpoints return lists (queryset) for viewsets; pick first item if present
      const cartData = Array.isArray(cartResponse.data)
        ? cartResponse.data[0] || { items: [], total: 0 }
        : cartResponse.data;
      const wishlistData = Array.isArray(wishlistResponse.data)
        ? wishlistResponse.data[0] || { products: [] }
        : wishlistResponse.data;

      setCart(cartData);
      setWishlist(wishlistData);
    } catch (error) {
      console.error("Failed to load store data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart and wishlist after auth ready
  useEffect(() => {
    // Only load store data when auth initialization finished.
    // Many API endpoints require authentication (cart, wishlist, orders).
    if (!authLoading) {
      if (user) {
        loadStoreData();
        loadOrders();
      } else {
        // Reset store to defaults for anonymous users
        setCart({ items: [], total: 0 });
        setWishlist({ products: [] });
        setOrders([]);
        setLoading(false);
      }
    }
  }, [authLoading, user]);

  // Cart operations
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);

      // Optimistic update
      const tempId = Date.now();
      const optimisticItem = {
        id: tempId,
        product: { id: productId },
        quantity: quantity,
        temp: true,
      };

      setCart((prev) => ({
        ...prev,
        items: [...(prev.items || []), optimisticItem],
      }));

      await cartAPI.addItem({
        product_id: productId,
        quantity,
      });

      // Fetch updated cart
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;
      setCart(cartData);
      return true;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      // Revert optimistic update
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => !i.temp),
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);

      // Store previous state
      const previousCart = { ...cart };

      // Convert quantity to integer and ensure it's valid
      const validQuantity = Math.max(1, parseInt(quantity) || 1);

      // Optimistic update
      const updatedItems = (cart.items || []).map((item) =>
        item.id === itemId ? { ...item, quantity: validQuantity } : item
      );

      setCart((prev) => ({
        ...prev,
        items: updatedItems,
      }));

      // Send update to server
      await cartAPI.updateItem(itemId, { quantity: validQuantity });

      // Fetch fresh cart data
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;

      setCart(cartData);
      return true;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      // Revert to previous state
      setCart(previousCart);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // alias for existing name used by some components
  const updateQty = (itemId, qty) => updateCartItem(itemId, qty);

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);

      // Store previous state
      const previousCart = { ...cart };

      // Optimistic update
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));

      await cartAPI.removeItem(itemId);

      // Fetch updated cart
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;
      setCart(cartData);
      return true;
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      // Revert to previous state
      setCart(previousCart);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (shipping_address = "") => {
    try {
      const res = await orderAPI.create({ shipping_address });
      // refresh cart and orders
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;
      setCart(cartData);
      const ordersRes = await orderAPI.list();
      setOrders(ordersRes.data);
      return res.data;
    } catch (error) {
      console.error("Failed to place order:", error);
      return null;
    }
  };

  // Wishlist operations
  const addToWishlist = async (productId) => {
    try {
      // Check if product is already in wishlist
      if (wishlist?.products?.some((p) => p.id === productId)) {
        return true; // Already in wishlist
      }

      setLoading(true);

      // Store previous state
      const previousWishlist = { ...wishlist };

      // Optimistic update with full product data
      setWishlist((prev) => ({
        ...prev,
        products: [...(prev?.products || []), { id: productId, temp: true }],
      }));

      // Prefer collection-level API that acts on the current user's wishlist
      // This is more robust than trying to discover the wishlist id in some API shapes
      const addRes = await wishlistAPI.addProductForUser(productId);
      console.log("wishlist add response:", addRes && addRes.data);
      // If the API returned the wishlist object, update local state immediately
      if (addRes && addRes.data) {
        // Some API shapes return the wishlist object, or serializer data
        const data = addRes.data;
        // If response is a list (unlikely for collection action), normalize
        const wishlistObj = Array.isArray(data)
          ? data[0] || { products: [] }
          : data;
        setWishlist(wishlistObj);
      }
      // Reload store data to ensure consistency
      await loadStoreData();
      return true;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      // Revert to previous state
      setWishlist(previousWishlist);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);

      // Use collection-level remove to act on current user's wishlist
      const previousWishlist = { ...wishlist };
      setWishlist((prev) => ({
        ...prev,
        products: (prev?.products || []).filter(
          (product) => product.id !== productId
        ),
      }));

      const remRes = await wishlistAPI.removeProductForUser(productId);
      console.log("wishlist remove response:", remRes && remRes.data);
      if (remRes && remRes.data) {
        const data = remRes.data;
        const wishlistObj = Array.isArray(data)
          ? data[0] || { products: [] }
          : data;
        setWishlist(wishlistObj);
      }
      // Reload store data to ensure consistency
      await loadStoreData();
      return true;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      // Revert to previous state
      setWishlist(previousWishlist);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Orders
  const [orders, setOrders] = useState([]);

  async function loadOrders() {
    try {
      const res = await orderAPI.list();
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  }

  const clearCart = async () => {
    try {
      await Promise.all(cart.items.map((item) => cartAPI.removeItem(item.id)));
      setCart({ items: [], total: 0 });
      return true;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      return false;
    }
  };

  // (UI helpers for toggling wishlist live in components; context exposes add/remove functions)

  const value = {
    cart: cart,
    cartItems: cart.items || [],
    wishlist: wishlist,
    wishlistProducts: wishlist.products || [],
    orders: orders,
    loading: loading,
    addToCart: addToCart,
    updateCartItem: updateCartItem,
    updateQty: updateQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    addToWishlist: addToWishlist,
    removeFromWishlist: removeFromWishlist,
    placeOrder: placeOrder,
    loadOrders: loadOrders,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};
