import axios from "axios";

/**
 * Generates a UUID for user identification.
 */
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Automatically authenticates the user using a unique user_id.
 * If backend requires email, it generates dummy email: user_<UUID>@app.com.
 * If user does not exist, it registers them automatically.
 */
export const authBootstrap = async () => {
  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem("user_id", userId);
  }

  const token = localStorage.getItem("token");
  
  // If we have a token, we might still want to verify it, 
  // but AuthContext already does that in initializeAuth.
  // Our goal here is to ENSURE a token exists if missing.
  if (token) return token;

  const username = `user_${userId}`;
  const password = userId; // Using UUID as password for simplicity
  const apiUrl = process.env.REACT_APP_API_URL || "";

  try {
    console.log("[AUTH BOOTSTRAP] Attempting silent login...");
    const loginRes = await axios.post(`${apiUrl}/api/auth/login`, {
      username,
      password
    });

    if (loginRes.data.success && loginRes.data.accessToken) {
      localStorage.setItem("token", loginRes.data.accessToken);
      console.log("[AUTH BOOTSTRAP] Silent login successful.");
      return loginRes.data.accessToken;
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      console.log("[AUTH BOOTSTRAP] User not found or invalid credentials. Attempting silent registration...");
      try {
        const regRes = await axios.post(`${apiUrl}/api/auth/register`, {
          username,
          password
        });
        if (regRes.data.success && regRes.data.accessToken) {
          localStorage.setItem("token", regRes.data.accessToken);
          console.log("[AUTH BOOTSTRAP] Silent registration successful.");
          return regRes.data.accessToken;
        }
      } catch (regError) {
        console.error("[AUTH BOOTSTRAP] Silent registration failed:", regError);
      }
    } else {
      console.error("[AUTH BOOTSTRAP] Silent login failed with unexpected error:", error);
    }
  }

  return null;
};
