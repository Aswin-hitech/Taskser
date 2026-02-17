const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config/jwt");

const generateAccessToken = (user) => {
    if (!ACCESS_TOKEN_SECRET) {
        console.error("ACCESS_TOKEN_SECRET is missing. Cannot generate token.");
        return null;
    }
    return jwt.sign(
        { id: user._id, username: user.username },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (user) => {
    if (!REFRESH_TOKEN_SECRET) {
        console.error("REFRESH_TOKEN_SECRET is missing. Cannot generate token.");
        return null;
    }
    return jwt.sign(
        { id: user._id, username: user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
    );
};

const verifyAccessToken = (token) => {
    try {
        if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET missing");
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
        console.error("Access token verification failed:", error.message);
        return null;
    }
};

const verifyRefreshToken = (token) => {
    try {
        if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET missing");
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
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
