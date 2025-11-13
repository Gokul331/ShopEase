import React, { createContext, useContext, useState, useEffect } from "react";
import {
  cartAPI,
  wishlistAPI,
  orderAPI,
  addressAPI,
  userAPI,
} from "../services/api";
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
  // State with loading flags
  const [state, setState] = useState({
    cart: { items: [], total: 0, loaded: false },
    wishlist: { products: [], loaded: false },
    addresses: { list: [], loaded: false },
    orders: { list: [], loaded: false },
    profile: { data: null, loaded: false },
    paymentMethods: { list: [], loaded: false },
  });

  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Cache with timestamps (5 minutes TTL)
  const [cache, setCache] = useState({
    cart: { timestamp: null, ttl: 2 * 60 * 1000 }, // 2 minutes for cart
    addresses: { timestamp: null, ttl: 5 * 60 * 1000 }, // 5 minutes
    orders: { timestamp: null, ttl: 10 * 60 * 1000 }, // 10 minutes
    wishlist: { timestamp: null, ttl: 5 * 60 * 1000 }, // 5 minutes
    profile: { timestamp: null, ttl: 30 * 60 * 1000 }, // 30 minutes
  });

  // Helper to check if cache is valid
  const isCacheValid = (type) => {
    const cacheEntry = cache[type];
    return (
      cacheEntry.timestamp && Date.now() - cacheEntry.timestamp < cacheEntry.ttl
    );
  };

  // Helper to update cache
  const updateCache = (type) => {
    setCache((prev) => ({
      ...prev,
      [type]: { ...prev[type], timestamp: Date.now() },
    }));
  };

  // ========== CRITICAL DATA - Load immediately ==========

  const loadCriticalData = async () => {
    try {
      setLoading(true);

      // Load cart and profile in parallel (critical for user experience)
      const [cartResponse, profileResponse] = await Promise.all([
        cartAPI.get(),
        userAPI.profile?.().catch(() => ({ data: null })), // Graceful fallback
      ]);

      // Process cart data
      const cartData = Array.isArray(cartResponse.data)
        ? cartResponse.data[0] || { items: [], total: 0 }
        : cartResponse.data;

      setState((prev) => ({
        ...prev,
        cart: { ...cartData, loaded: true },
        profile: { data: profileResponse?.data || null, loaded: true },
      }));

      updateCache("cart");
      updateCache("profile");
    } catch (error) {
      console.error("Failed to load critical data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== SECONDARY DATA - Load on demand ==========

  const loadAddresses = async (forceRefresh = false) => {
    if (state.addresses.loaded && !forceRefresh && isCacheValid("addresses")) {
      return state.addresses.list;
    }

    try {
      setLoading(true);
      const response = await addressAPI.list();
      const addressesData = Array.isArray(response.data) ? response.data : [];

      setState((prev) => ({
        ...prev,
        addresses: { list: addressesData, loaded: true },
      }));

      updateCache("addresses");
      return addressesData;
    } catch (error) {
      console.error("Failed to load addresses:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async (forceRefresh = false) => {
    if (state.wishlist.loaded && !forceRefresh && isCacheValid("wishlist")) {
      return state.wishlist.products;
    }

    try {
      setLoading(true);
      const response = await wishlistAPI.get();
      const wishlistData = Array.isArray(response.data)
        ? response.data[0] || { products: [] }
        : response.data;

      setState((prev) => ({
        ...prev,
        wishlist: { products: wishlistData.products || [], loaded: true },
      }));

      updateCache("wishlist");
      return wishlistData.products;
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (forceRefresh = false) => {
    if (state.orders.loaded && !forceRefresh && isCacheValid("orders")) {
      return state.orders.list;
    }

    try {
      setLoading(true);
      const response = await orderAPI.list();
      const ordersData = Array.isArray(response.data) ? response.data : [];

      setState((prev) => ({
        ...prev,
        orders: { list: ordersData, loaded: true },
      }));

      updateCache("orders");
      return ordersData;
    } catch (error) {
      console.error("Failed to load orders:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ========== DATA INITIALIZATION ==========

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // Load critical data immediately
        loadCriticalData();

        // Load secondary data in background (non-blocking)
        Promise.allSettled([
          loadAddresses(),
          loadWishlist(),
          loadOrders(),
        ]).then((results) => {
          console.log("Background data loading completed:", results);
        });
      } else {
        // Reset all data for anonymous users
        setState({
          cart: { items: [], total: 0, loaded: false },
          wishlist: { products: [], loaded: false },
          addresses: { list: [], loaded: false },
          orders: { list: [], loaded: false },
          profile: { data: null, loaded: false },
        });
        setLoading(false);
      }
    }
  }, [authLoading, user]);

  // ========== CART OPERATIONS ==========

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);

      // Ensure cart is loaded
      if (!state.cart.loaded) {
        await loadCriticalData();
      }

      // Optimistic update
      const tempId = Date.now();
      const optimisticItem = {
        id: tempId,
        product: { id: productId },
        quantity: quantity,
        temp: true,
      };

      setState((prev) => ({
        ...prev,
        cart: {
          ...prev.cart,
          items: [...(prev.cart.items || []), optimisticItem],
        },
      }));

      await cartAPI.addItem({
        product_id: productId,
        quantity,
      });

      // Refresh cart data
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;

      setState((prev) => ({
        ...prev,
        cart: { ...cartData, loaded: true },
      }));

      updateCache("cart");
      return true;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      // Revert optimistic update
      setState((prev) => ({
        ...prev,
        cart: {
          ...prev.cart,
          items: prev.cart.items.filter((i) => !i.temp),
        },
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
      const previousCart = { ...state.cart };

      // Convert quantity to integer and ensure it's valid
      const validQuantity = Math.max(1, parseInt(quantity) || 1);

      // Optimistic update
      const updatedItems = (state.cart.items || []).map((item) =>
        item.id === itemId ? { ...item, quantity: validQuantity } : item
      );

      setState((prev) => ({
        ...prev,
        cart: {
          ...prev.cart,
          items: updatedItems,
        },
      }));

      // Send update to server
      await cartAPI.updateItem(itemId, { quantity: validQuantity });

      // Fetch fresh cart data
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;

      setState((prev) => ({
        ...prev,
        cart: { ...cartData, loaded: true },
      }));

      updateCache("cart");
      return true;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      // Revert to previous state
      setState((prev) => ({
        ...prev,
        cart: previousCart,
      }));
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
      const previousCart = { ...state.cart };

      // Optimistic update
      setState((prev) => ({
        ...prev,
        cart: {
          ...prev.cart,
          items: prev.cart.items.filter((item) => item.id !== itemId),
        },
      }));

      await cartAPI.removeItem(itemId);

      // Fetch updated cart
      const updatedCart = await cartAPI.get();
      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;

      setState((prev) => ({
        ...prev,
        cart: { ...cartData, loaded: true },
      }));

      updateCache("cart");
      return true;
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      // Revert to previous state
      setState((prev) => ({
        ...prev,
        cart: previousCart,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await Promise.all(
        state.cart.items.map((item) => cartAPI.removeItem(item.id))
      );

      setState((prev) => ({
        ...prev,
        cart: { items: [], total: 0, loaded: true },
      }));

      updateCache("cart");
      return true;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      return false;
    }
  };

  // ========== ADDRESS OPERATIONS ==========

  const addAddress = async (addressData) => {
    try {
      setLoading(true);

      // Ensure addresses are loaded
      if (!state.addresses.loaded) {
        await loadAddresses();
      }

      // Generate temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticAddress = {
        ...addressData,
        id: tempId,
        temp: true,
      };

      // Optimistic update
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: [...prev.addresses.list, optimisticAddress],
        },
      }));

      // Real API call
      const response = await addressAPI.create(addressData);

      // Update with real data from server
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: prev.addresses.list.map((addr) =>
            addr.id === tempId ? { ...response.data, temp: false } : addr
          ),
        },
      }));

      updateCache("addresses");
      return response.data;
    } catch (error) {
      console.error("Failed to add address:", error);
      // Revert optimistic update
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: prev.addresses.list.filter((addr) => addr.id !== tempId),
        },
      }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (addressId) => {
    try {
      setLoading(true);

      // Store previous state for rollback
      const previousAddresses = [...state.addresses.list];

      // Optimistic update
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: prev.addresses.list.filter((addr) => addr.id !== addressId),
        },
      }));

      // Real API call
      await addressAPI.remove(addressId);

      updateCache("addresses");
      return true;
    } catch (error) {
      console.error("Failed to remove address:", error);
      // Revert to previous state
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: previousAddresses,
        },
      }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editAddress = async (addressId, updatedData) => {
    try {
      setLoading(true);

      // Store previous state for rollback
      const previousAddresses = [...state.addresses.list];

      // Optimistic update
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: prev.addresses.list.map((addr) =>
            addr.id === addressId
              ? { ...addr, ...updatedData, updating: true }
              : addr
          ),
        },
      }));

      // Real API call
      const response = await addressAPI.update(addressId, updatedData);

      // Update with real data from server
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: prev.addresses.list.map((addr) =>
            addr.id === addressId ? { ...response.data, updating: false } : addr
          ),
        },
      }));

      updateCache("addresses");
      return response.data;
    } catch (error) {
      console.error("Failed to edit address:", error);
      // Revert to previous state
      setState((prev) => ({
        ...prev,
        addresses: {
          ...prev.addresses,
          list: previousAddresses,
        },
      }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ========== WISHLIST OPERATIONS ==========

  const addToWishlist = async (productId) => {
    try {
      // Ensure wishlist is loaded
      if (!state.wishlist.loaded) {
        await loadWishlist();
      }

      // Check if product is already in wishlist
      if (state.wishlist.products?.some((p) => p.id === productId)) {
        return true; // Already in wishlist
      }

      setLoading(true);

      // Store previous state
      const previousWishlist = { ...state.wishlist };

      // Optimistic update with full product data
      setState((prev) => ({
        ...prev,
        wishlist: {
          ...prev.wishlist,
          products: [
            ...(prev.wishlist.products || []),
            { id: productId, temp: true },
          ],
        },
      }));

      const addRes = await wishlistAPI.addProductForUser(productId);

      if (addRes && addRes.data) {
        const data = addRes.data;
        const wishlistObj = Array.isArray(data)
          ? data[0] || { products: [] }
          : data;

        setState((prev) => ({
          ...prev,
          wishlist: { products: wishlistObj.products || [], loaded: true },
        }));
      }

      updateCache("wishlist");
      return true;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      // Revert to previous state
      setState((prev) => ({
        ...prev,
        wishlist: previousWishlist,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);

      // Store previous state
      const previousWishlist = { ...state.wishlist };

      setState((prev) => ({
        ...prev,
        wishlist: {
          ...prev.wishlist,
          products: (prev.wishlist.products || []).filter(
            (product) => product.id !== productId
          ),
        },
      }));

      const remRes = await wishlistAPI.removeProductForUser(productId);

      if (remRes && remRes.data) {
        const data = remRes.data;
        const wishlistObj = Array.isArray(data)
          ? data[0] || { products: [] }
          : data;

        setState((prev) => ({
          ...prev,
          wishlist: { products: wishlistObj.products || [], loaded: true },
        }));
      }

      updateCache("wishlist");
      return true;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      // Revert to previous state
      setState((prev) => ({
        ...prev,
        wishlist: previousWishlist,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========== ORDER OPERATIONS ==========

  const placeOrder = async (shipping_address = "") => {
    try {
      const res = await orderAPI.create({ shipping_address });

      // Refresh cart and orders
      const [updatedCart, ordersRes] = await Promise.all([
        cartAPI.get(),
        orderAPI.list(),
      ]);

      const cartData = Array.isArray(updatedCart.data)
        ? updatedCart.data[0] || { items: [], total: 0 }
        : updatedCart.data;

      setState((prev) => ({
        ...prev,
        cart: { ...cartData, loaded: true },
        orders: { list: ordersRes.data, loaded: true },
      }));

      updateCache("cart");
      updateCache("orders");

      return res.data;
    } catch (error) {
      console.error("Failed to place order:", error);
      return null;
    }
  };
// In your StoreContext, add these functions:

// Payment Methods operations
const loadPaymentMethods = async (forceRefresh = false) => {
  if (state.paymentMethods.loaded && !forceRefresh && isCacheValid('paymentMethods')) {
    return state.paymentMethods.list;
  }

  try {
    setLoading(true);
    // Replace with your actual payment methods API call
    // const response = await paymentAPI.list();
    const response = { data: [] }; // Mock response for now
    const paymentMethodsData = Array.isArray(response.data) ? response.data : [];

    setState(prev => ({
      ...prev,
      paymentMethods: { list: paymentMethodsData, loaded: true }
    }));

    updateCache('paymentMethods');
    return paymentMethodsData;

  } catch (error) {
    console.error("Failed to load payment methods:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};

const addPaymentMethod = async (paymentData) => {
  try {
    setLoading(true);
    
    // Generate temporary ID for optimistic update
    const tempId = `temp-payment-${Date.now()}`;
    const optimisticPayment = {
      ...paymentData,
      id: tempId,
      temp: true,
    };

    // Optimistic update
    setState(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        list: [...prev.paymentMethods.list, optimisticPayment]
      }
    }));

    // Replace with your actual API call
    // const response = await paymentAPI.create(paymentData);
    const response = { data: { ...paymentData, id: Date.now() } }; // Mock response

    // Update with real data from server
    setState(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        list: prev.paymentMethods.list.map(payment => 
          payment.id === tempId ? { ...response.data, temp: false } : payment
        )
      }
    }));

    updateCache('paymentMethods');
    return response.data;

  } catch (error) {
    console.error("Failed to add payment method:", error);
    // Revert optimistic update
    setState(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        list: prev.paymentMethods.list.filter(payment => payment.id !== tempId)
      }
    }));
    throw error;
  } finally {
    setLoading(false);
  }
};

const deletePaymentMethod = async (paymentId) => {
  try {
    setLoading(true);
    
    // Store previous state for rollback
    const previousPayments = [...state.paymentMethods.list];
    
    // Optimistic update
    setState(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        list: prev.paymentMethods.list.filter(payment => payment.id !== paymentId)
      }
    }));

    // Replace with your actual API call
    // await paymentAPI.remove(paymentId);

    updateCache('paymentMethods');
    return true;

  } catch (error) {
    console.error("Failed to delete payment method:", error);
    // Revert to previous state
    setState(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        list: previousPayments
      }
    }));
    throw error;
  } finally {
    setLoading(false);
  }
};

const setDefaultPaymentMethod = async (paymentId) => {
  try {
    setLoading(true);
    
    // Update all payment methods to set the specified one as default
    setState(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        list: prev.paymentMethods.list.map(payment => ({
          ...payment,
          is_default: payment.id === paymentId
        }))
      }
    }));

    // Replace with your actual API call
    // await paymentAPI.setDefault(paymentId);

    updateCache('paymentMethods');
    return true;

  } catch (error) {
    console.error("Failed to set default payment method:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};


  // ========== CONTEXT VALUE ==========

  const value = {
    // State
    cart: state.cart,
    cartItems: state.cart.items || [],
    wishlist: state.wishlist,
    wishlistProducts: state.wishlist.products || [],
    orders: state.orders.list,
    addresses: state.addresses.list,
    profile: state.profile.data,

    // Loading states
    loading: loading,
    dataLoaded: {
      cart: state.cart.loaded,
      addresses: state.addresses.loaded,
      orders: state.orders.loaded,
      wishlist: state.wishlist.loaded,
      profile: state.profile.loaded,
    },

    // Cart operations
    addToCart,
    updateCartItem,
    updateQty,
    removeFromCart,
    clearCart,

    // Wishlist operations
    addToWishlist,
    removeFromWishlist,

    // Address operations
    addAddress,
    removeAddress,
    editAddress,

    // Order operations
    placeOrder,

    // Data loading functions (for on-demand loading)
    loadAddresses,
    loadWishlist,
    loadOrders,
    loadCriticalData,

    // Force refresh functions
    refreshAddresses: () => loadAddresses(true),
    refreshWishlist: () => loadWishlist(true),
    refreshOrders: () => loadOrders(true),
    refreshCart: () => loadCriticalData(),

    // Payment method operations
    loadPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};
