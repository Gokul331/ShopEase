import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      await fetchUserProfile();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || "Registration failed",
      };
    }
  };

  const logout = () => {
    // Try to notify backend to blacklist the refresh token, then clear local state
    (async () => {
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (refresh) {
          await authAPI.logout(refresh);
        }
      } catch (e) {
        // ignore errors during logout request
        console.warn("Logout request failed", e);
      } finally {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      }
    })();
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
