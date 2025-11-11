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

    // If there's no response object it's most likely a network error
    // (server not running, CORS preflight failure, etc.). Mark it so
    // callers can handle it and avoid reading `error.response.status`.
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
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
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
  login: (credentials) => api.post("/token/", credentials),
  register: (userData) => api.post("/users/", userData),
  getProfile: () => api.get("/users/me/"),
  logout: (refreshToken) => api.post("/logout/", { refresh: refreshToken }),
};

export const profileAPI = {
  get: () => api.get("/profile/"),
  update: (data) => api.patch("/profile/", data),
};

export const productAPI = {
  list: () => api.get("/products/"),
  retrieve: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post("/products/", data),
};

export const categoryAPI = {
  list: () => api.get("/categories/"),
  retrieve: (id) => api.get(`/categories/${id}/`),
};

export const cartAPI = {
  get: () => api.get("/cart/"),
  addItem: (data) => api.post("/cart-items/", data),
  updateItem: (id, data) => api.patch(`/cart-items/${id}/`, data),
  removeItem: (id) => api.delete(`/cart-items/${id}/`),
};

export const wishlistAPI = {
  get: () => api.get("/wishlist/"),
  create: (data) => api.post("/wishlist/", data || {}),
  addProduct: (id, productId) =>
    api.post(`/wishlist/${id}/add_product/`, { product_id: productId }),
  removeProduct: (id, productId) =>
    api.post(`/wishlist/${id}/remove_product/`, { product_id: productId }),
  // collection-level helpers that act on the current user's wishlist
  addProductForUser: (productId) =>
    api.post(`/wishlist/add_product_current/`, { product_id: productId }),
  removeProductForUser: (productId) =>
    api.post(`/wishlist/remove_product_current/`, { product_id: productId }),
};

export const orderAPI = {
  list: () => api.get("/orders/"),
  retrieve: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post("/orders/", data),
  getOrderItems: (orderId) => api.get(`/order-items/?order=${orderId}`),
};

export const bannerAPI = {
  list: () => api.get("/banners/"),
  retrieve: (id) => api.get(`/banners/${id}/`),
};

export const addressAPI = {
  list: () => api.get("/addresses/"),
  retrieve: (id) => api.get(`/addresses/${id}/`),
  create: (data) => api.post(`/addresses/`, data),
  update: (id, data) => api.patch(`/addresses/${id}/`, data),
  remove: (id) => api.delete(`/addresses/${id}/`),
};

export const cardAPI = {
  list: () => api.get("/cards/"),
  retrieve: (id) => api.get(`/cards/${id}/`),
  create: (data) => api.post(`/cards/`, data),
  update: (id, data) => api.patch(`/cards/${id}/`, data),
  remove: (id) => api.delete(`/cards/${id}/`),
};

export const recentlyViewedAPI = {
  list: () => api.get("/recently-viewed/"),
  create: (data) => api.post("/recently-viewed/", data),
  retrieve: (id) => api.get(`/recently-viewed/${id}/`),
  remove: (id) => api.delete(`/recently-viewed/${id}/`),
};

export default api;
