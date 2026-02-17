const path = require("path");

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: path.join(__dirname, "../.env") });
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Normalizes and retrieves secrets. 
 * Allows for generic JWT_SECRET fallback if specific ones are missing.
 */
const getSecret = (key, fallbackKey, devDefault) => {
    const value = process.env[key] || process.env[fallbackKey];

    if (!value) {
        if (isProduction) return null;
        return devDefault;
    }
    return value;
};

const ACCESS_TOKEN_SECRET = getSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET", "dev_access_token_secret_321");
const REFRESH_TOKEN_SECRET = getSecret("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET", "dev_refresh_token_secret_654");

const config = {
    isProduction,
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5000",
    accessSecret: ACCESS_TOKEN_SECRET,
    refreshSecret: REFRESH_TOKEN_SECRET,

    // Validation Check
    isValid: !!(ACCESS_TOKEN_SECRET && REFRESH_TOKEN_SECRET),

    // Diagnostic Info
    getDiagnostics: () => ({
        environment: process.env.NODE_ENV || "development",
        port: process.env.PORT || 3000,
        secretsLoaded: !!(ACCESS_TOKEN_SECRET && REFRESH_TOKEN_SECRET),
        source: isProduction ? "Host Environment Variables" : ".env file or Fallbacks",
        missing: [
            !ACCESS_TOKEN_SECRET && "ACCESS_TOKEN_SECRET",
            !REFRESH_TOKEN_SECRET && "REFRESH_TOKEN_SECRET"
        ].filter(Boolean)
    })
};

module.exports = config;
