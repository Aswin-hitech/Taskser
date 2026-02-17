import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Request interceptor moved to AuthContext to access state

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh token to get initial session
        const res = await axios.post("/api/auth/refresh");
        const { accessToken } = res.data;

        setAccessToken(accessToken);

        const decoded = jwtDecode(accessToken);
        setUser({ id: decoded.id, username: decoded.username });
      } catch (error) {
        // Silent fail - user is not logged in
        console.log("No active session");
        setUser(null);
        setAccessToken(null);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Axios interceptor to add token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt refresh
            const res = await axios.post("/api/auth/refresh");
            const { accessToken: newAccessToken } = res.data;

            setAccessToken(newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]); // Re-run when accessToken changes

  const login = async (username, password) => {
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });

      const { accessToken } = res.data;
      setAccessToken(accessToken);

      const decoded = jwtDecode(accessToken);
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

      const { accessToken } = res.data;
      setAccessToken(accessToken);

      const decoded = jwtDecode(accessToken);
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

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    }
    setAccessToken(null);
    setUser(null);
  };

  const getAuthToken = () => accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getAuthToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};