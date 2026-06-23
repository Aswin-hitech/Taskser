const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const isProduction = process.env.NODE_ENV === "production";

const parseOrigins = (value) => {
  if (!value) {
    return ["http://localhost:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getSecret = (name, fallback, devDefault) => {
  const value = process.env[name] || process.env[fallback];

  if (value) {
    return value;
  }

  return isProduction ? null : devDefault;
};

const config = {
  env: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  allowedOrigins: parseOrigins(process.env.FRONTEND_URL),
  accessSecret: getSecret(
    "ACCESS_TOKEN_SECRET",
    "JWT_SECRET",
    "dev_access_token_secret_change_me"
  ),
  refreshSecret: getSecret(
    "REFRESH_TOKEN_SECRET",
    "JWT_REFRESH_SECRET",
    "dev_refresh_token_secret_change_me"
  ),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  cookieName: process.env.REFRESH_COOKIE_NAME || "taskser_refresh",
  isValid:
    !!getSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET") &&
    !!getSecret("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET") &&
    !!(process.env.MONGO_URI || !isProduction),
  getDiagnostics: () => ({
    environment: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    secretsLoaded: !!(
      getSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET") &&
      getSecret("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET")
    ),
    source: isProduction ? "Host Environment Variables" : ".env file",
    missing: [
      !process.env.MONGO_URI && "MONGO_URI",
      !getSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET") && "ACCESS_TOKEN_SECRET",
      !getSecret("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET") &&
        "REFRESH_TOKEN_SECRET",
    ].filter(Boolean),
  }),
};

module.exports = config;
