import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // App Bootstrap Loading State
  const [accessToken, setAccessToken] = useState(null);

  // Bootstrap: Check session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh token to get initial session
        // This validates the HTTP-Only cookie
        const res = await axios.post("/api/auth/refresh");
        const { accessToken } = res.data;

        setAccessToken(accessToken);
        const decoded = jwtDecode(accessToken);
        setUser({ id: decoded.id, username: decoded.username });
      } catch (error) {
        // No valid session (cookie missing or expired)
        console.log("No active session found.");
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false); // Bootstrap complete
      }
    };

    initializeAuth();
  }, []);

  // Axios Interceptors
  useEffect(() => {
    // Request Interceptor: Attach Access Token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401 (Silent Refresh)
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt silent refresh
            const res = await axios.post("/api/auth/refresh");
            const { accessToken: newAccessToken } = res.data;

            setAccessToken(newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed (cookie expired/invalid) -> Logout
            console.error("Session expired:", refreshError);
            logout(); // Clear state
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
  }, [accessToken]);


  const login = async (username, password) => {
    try {
      // Login sets HTTP-Only cookie and returns Access Token
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
