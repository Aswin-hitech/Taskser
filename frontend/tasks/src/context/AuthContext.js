import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const getToken = useCallback(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }, []);

  const setAuthToken = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  }, [setAuthToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (token) {
        try {
          const decoded = jwtDecode(token);

          if (decoded.exp * 1000 > Date.now()) {
            setAuthToken(token);
            setUser({ id: decoded.id, username: decoded.username });
          } else {
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
  }, [clearAuth, getToken, setAuthToken]);

  const login = async (username, password, rememberMe) => {
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      const token = res.data.token;

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      setAuthToken(token);
      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, username: decoded.username });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
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
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    clearAuth();
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
        getAuthToken: getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
