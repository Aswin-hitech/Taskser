import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            setUser({ id: decoded.id, username: decoded.username });
            // Set default header
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          } else {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });

      const { token } = res.data;

      // Save to localStorage
      localStorage.setItem("token", token);

      // Set default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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
      const res = await axios.post("/api/auth/register", { username, password });

      const { token } = res.data;

      // Save to localStorage
      localStorage.setItem("token", token);

      // Set default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, username: decoded.username });

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
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
