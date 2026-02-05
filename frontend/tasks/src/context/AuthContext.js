import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Request interceptor to add token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Function to get token from storage
  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            setUser({ id: decoded.id, username: decoded.username });
          } else {
            // Token expired, clear it
            clearAuth();
          }
        } catch (error) {
          console.error("Token decode error:", error);
          clearAuth();
        }
      }

      setAuthChecked(true);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password, rememberMe) => {
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });

      const token = res.data.token;

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, username: decoded.username });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };

  const register = async (username, password) => {
    try {
      await axios.post("/api/auth/register", { username, password });
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    }
  };

  const logout = () => {
    clearAuth();
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const getAuthToken = () => {
    return getToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        login,
        register,
        logout,
        isAuthenticated,
        getAuthToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};