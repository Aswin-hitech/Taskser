const jwt = require("jsonwebtoken");

const getSecret = (key, defaultValue) => {
    const value = process.env[key];
    if (!value) {
        if (process.env.NODE_ENV === "production") {
            console.error(`CRITICAL ERROR: ${key} is not defined in environment variables.`);
            return null;
        }
        console.warn(`WARNING: ${key} is not defined. Using development default.`);
        return defaultValue;
    }
    return value;
};

const ACCESS_TOKEN_SECRET = getSecret("ACCESS_TOKEN_SECRET", "dev_access_secret_123");
const REFRESH_TOKEN_SECRET = getSecret("REFRESH_TOKEN_SECRET", "dev_refresh_secret_456");

const validateConfig = () => {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("JWT secrets are missing in production environment.");
        }
        return false;
    }
    return true;
};

module.exports = {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    validateConfig,
};
