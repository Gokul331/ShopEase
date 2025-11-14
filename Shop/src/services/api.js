import axios from "axios";

const API_BASE_URL = "https://shopeasee.pythonanywhere.com/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      error.isNetworkError = true;
      console.error("Network error or no response from API:", error.message);
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Fixed URL - removed extra slash
          const response = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("token/", credentials),
  register: (userData) => api.post("users/", userData),
  getProfile: () => api.get("users/me/"),
  logout: (refreshToken) => api.post("logout/", { refresh: refreshToken }),
};

export const userAPI = {
  // Note: Your UserViewSet has 'me' action at /users/me/, not /user/profile/
  getCurrentUser: () => api.get("users/me/"),
  updateUser: (id, data) => api.patch(`users/${id}/`, data),
  deleteUser: (id) => api.delete(`users/${id}/`),
};

export const productAPI = {
  list: (params = {}) => api.get("products/", { params }),
  retrieve: (id) => api.get(`products/${id}/`),
  create: (data) => api.post("products/", data),
  update: (id, data) => api.patch(`products/${id}/`, data),
  delete: (id) => api.delete(`products/${id}/`),
  getImages: (productId) => api.get(`products/${productId}/images/`),
  getSpecifications: (productId) => api.get(`products/${productId}/specifications/`),
  getVariants: (productId) => api.get(`products/${productId}/variants/`),
  getByCategory: (categoryId) => api.get(`categories/${categoryId}/products/`),
  getByBrand: (brandId) => api.get(`brands/${brandId}/products/`),
};

export const categoryAPI = {
  list: () => api.get("categories/"),
  retrieve: (id) => api.get(`categories/${id}/`),
  create: (data) => api.post("categories/", data),
  update: (id, data) => api.patch(`categories/${id}/`, data),
  delete: (id) => api.delete(`categories/${id}/`),
};

export const brandAPI = {
  list: () => api.get("brands/"),
  retrieve: (id) => api.get(`brands/${id}/`),
  create: (data) => api.post("brands/", data),
  update: (id, data) => api.patch(`brands/${id}/`, data),
  delete: (id) => api.delete(`brands/${id}/`),
};

export const cartAPI = {
  get: () => api.get("cart/"),
  create: (data) => api.post("cart/", data),
  update: (id, data) => api.patch(`cart/${id}/`, data),
  delete: (id) => api.delete(`cart/${id}/`),
  addItem: (data) => api.post("cart-items/", data),
  updateItem: (id, data) => api.patch(`cart-items/${id}/`, data),
  removeItem: (id) => api.delete(`cart-items/${id}/`),
  clear: () => api.get("cart/").then(cart => {
    // Clear all items from cart
    const itemIds = cart.data.items?.map(item => item.id) || [];
    return Promise.all(itemIds.map(id => api.delete(`cart-items/${id}/`)));
  }),
};

export const wishlistAPI = {
  get: () => api.get("wishlist/"),
  create: (data) => api.post("wishlist/", data),
  update: (id, data) => api.patch(`wishlist/${id}/`, data),
  delete: (id) => api.delete(`wishlist/${id}/`),
  // Collection-level helpers (recommended - use these)
  addProduct: (productId) => api.post("wishlist/add-product/", { product_id: productId }),
  removeProduct: (productId) => api.post("wishlist/remove-product/", { product_id: productId }),
  // Instance-level helpers (if needed for specific wishlists)
  addProductToWishlist: (wishlistId, productId) => 
    api.post(`wishlist/${wishlistId}/add_product/`, { product_id: productId }),
  removeProductFromWishlist: (wishlistId, productId) => 
    api.post(`wishlist/${wishlistId}/remove_product/`, { product_id: productId }),
};

export const orderAPI = {
  list: () => api.get("orders/"),
  retrieve: (id) => api.get(`orders/${id}/`),
  create: (data) => api.post("orders/", data),
  update: (id, data) => api.patch(`orders/${id}/`, data),
  cancel: (id) => api.patch(`orders/${id}/`, { status: "cancelled" }),
  getUserOrders: () => api.get("user/orders/"),
  getOrderItems: (orderId) => api.get(`order-items/?order=${orderId}`),
};

export const addressAPI = {
  list: () => api.get("addresses/"),
  retrieve: (id) => api.get(`addresses/${id}/`),
  create: (data) => api.post("addresses/", data),
  update: (id, data) => api.patch(`addresses/${id}/`, data),
  delete: (id) => api.delete(`addresses/${id}/`),
  setDefault: (id) => api.patch(`addresses/${id}/`, { is_default: true }),
};

export const cardAPI = {
  list: () => api.get("cards/"),
  retrieve: (id) => api.get(`cards/${id}/`),
  create: (data) => api.post("cards/", data),
  update: (id, data) => api.patch(`cards/${id}/`, data),
  delete: (id) => api.delete(`cards/${id}/`),
  setDefault: (id) => api.patch(`cards/${id}/`, { is_default: true }),
};

export const recentlyViewedAPI = {
  list: () => api.get("recently-viewed/"),
  create: (data) => api.post("recently-viewed/", data),
  retrieve: (id) => api.get(`recently-viewed/${id}/`),
  update: (id, data) => api.patch(`recently-viewed/${id}/`, data),
  delete: (id) => api.delete(`recently-viewed/${id}/`),
};

export const bannerAPI = {
  list: () => api.get("banners/"),
  retrieve: (id) => api.get(`banners/${id}/`),
  create: (data) => api.post("banners/", data),
  update: (id, data) => api.patch(`banners/${id}/`, data),
  delete: (id) => api.delete(`banners/${id}/`),
};

export const userProfileAPI = {
  get: () => api.get("profile/"),
  update: (data) => api.patch("profile/", data),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.isNetworkError) {
    return {
      message: "Network error. Please check your connection and try again.",
      status: 0
    };
  }
  
  const message = error.response?.data?.detail || 
                 error.response?.data?.message || 
                 error.response?.data?.error || 
                 "An unexpected error occurred";
  
  return {
    message,
    status: error.response?.status,
    data: error.response?.data
  };
};

export default api;