const jwt = require("jsonwebtoken");
const config = require("../config/env");

const generateAccessToken = (user) => {
    if (!config.accessSecret) {
        console.error("ACCESS_TOKEN_SECRET is missing. Cannot generate token.");
        return null;
    }
    return jwt.sign(
        { id: user._id, username: user.username },
        config.accessSecret,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (user) => {
    if (!config.refreshSecret) {
        console.error("REFRESH_TOKEN_SECRET is missing. Cannot generate token.");
        return null;
    }
    return jwt.sign(
        { id: user._id, username: user.username },
        config.refreshSecret,
        { expiresIn: "30d" }
    );
};

const verifyAccessToken = (token) => {
    try {
        if (!config.accessSecret) throw new Error("ACCESS_TOKEN_SECRET missing");
        return jwt.verify(token, config.accessSecret);
    } catch (error) {
        console.error("Access token verification failed:", error.message);
        return null;
    }
};

const verifyRefreshToken = (token) => {
    try {
        if (!config.refreshSecret) throw new Error("REFRESH_TOKEN_SECRET missing");
        return jwt.verify(token, config.refreshSecret);
    } catch (error) {
        console.error("Refresh token verification failed:", error.message);
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
