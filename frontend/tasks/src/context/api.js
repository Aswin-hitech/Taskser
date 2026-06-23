import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;
let authFailureHandler = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;
};

export const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = authClient
      .post("/api/auth/refresh")
      .then((response) => {
        setAccessToken(response.data.accessToken);
        return response.data;
      })
      .catch((error) => {
        clearAccessToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/api/auth/");

    if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshed = await refreshSession();
        if (refreshed?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        if (authFailureHandler) {
          authFailureHandler();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
