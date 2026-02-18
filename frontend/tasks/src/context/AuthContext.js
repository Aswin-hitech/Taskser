import { createContext, useState, useEffect } from "react";
import api from "./api";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.log("[AUTH] Initial session check failed.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post("/api/auth/login", { username, password });
      const { accessToken } = res.data;

      localStorage.setItem("token", accessToken);
      const decoded = jwtDecode(accessToken);
      setUser({ id: decoded.id, username: decoded.username });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };

  const register = async (username, password) => {
    try {
      const res = await api.post("/api/auth/register", { username, password });
      const { accessToken } = res.data;

      localStorage.setItem("token", accessToken);
      const decoded = jwtDecode(accessToken);
      setUser({ id: decoded.id, username: decoded.username });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
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
