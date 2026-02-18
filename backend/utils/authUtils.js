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
        { expiresIn: "7d" } // 1 week access
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
        { expiresIn: "30d" } // 1 month refresh
    );
};

const verifyAccessToken = (token) => {
    try {
        if (!config.accessSecret) throw new Error("ACCESS_TOKEN_SECRET missing");
        return jwt.verify(token, config.accessSecret);
    } catch (error) {
        return null; // Handle silently in middleware
    }
};

const verifyRefreshToken = (token) => {
    try {
        if (!config.refreshSecret) throw new Error("REFRESH_TOKEN_SECRET missing");
        return jwt.verify(token, config.refreshSecret);
    } catch (error) {
        return null; // Handle silently in routes
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
