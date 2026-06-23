import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api, {
  clearAccessToken,
  refreshSession,
  setAccessToken,
  setAuthFailureHandler,
} from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const session = await refreshSession();
      setUser(session.user || null);
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    setAuthFailureHandler(() => clearAuth);
    initializeAuth();

    return () => {
      setAuthFailureHandler(null);
    };
  }, [clearAuth, initializeAuth]);

  const login = useCallback(async (username, password, rememberMe) => {
    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
        rememberMe,
      });

      setAccessToken(res.data.accessToken);
      setUser(res.data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  }, []);

  const register = useCallback(async (username, password, rememberMe) => {
    try {
      const res = await api.post("/api/auth/register", {
        username,
        password,
        rememberMe,
      });

      setAccessToken(res.data.accessToken);
      setUser(res.data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      // Ignore logout transport failures and still clear client state.
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const deleteAccount = useCallback(
    async (password) => {
      try {
        await api.delete("/api/auth/account", { data: { password } });
        clearAuth();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Account deletion failed",
        };
      }
    },
    [clearAuth]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      deleteAccount,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, logout, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
