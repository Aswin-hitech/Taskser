const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/env");

const generateAccessToken = (user) => {
  if (!config.accessSecret) {
    console.error("ACCESS_TOKEN_SECRET is missing. Cannot generate token.");
    return null;
  }

  return jwt.sign({ id: user._id, username: user.username }, config.accessSecret, {
    expiresIn: config.accessTokenTtl,
  });
};

const generateRefreshToken = (user, rememberMe = true) => {
  if (!config.refreshSecret) {
    console.error("REFRESH_TOKEN_SECRET is missing. Cannot generate token.");
    return null;
  }

  return jwt.sign(
    { id: user._id, username: user.username, rememberMe: Boolean(rememberMe) },
    config.refreshSecret,
    {
      expiresIn: config.refreshTokenTtl,
    }
  );
};

const verifyAccessToken = (token) => {
  try {
    if (!config.accessSecret) throw new Error("ACCESS_TOKEN_SECRET missing");
    return jwt.verify(token, config.accessSecret);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    if (!config.refreshSecret) throw new Error("REFRESH_TOKEN_SECRET missing");
    return jwt.verify(token, config.refreshSecret);
  } catch (error) {
    return null;
  }
};

const hashRefreshToken = async (token) => {
  return bcrypt.hash(token, config.bcryptRounds);
};

const compareRefreshToken = async (token, hash) => {
  if (!token || !hash) return false;
  return bcrypt.compare(token, hash);
};

const getRefreshCookieOptions = (rememberMe = true) => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? "none" : "lax",
  maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined,
  path: "/api/auth",
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
  getRefreshCookieOptions,
};
