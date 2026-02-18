const jwt = require("jsonwebtoken");
const config = require("../config/env");

/**
 * Robust JWT Authentication Middleware
 * Validates Access Tokens and attaches user information to the request.
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.accessSecret);

        // Attach decoded user to request
        req.userSource = "token";
        req.userId = decoded.id;
        req.username = decoded.username;

        next();
    } catch (error) {
        console.error(`[AUTH ERROR] ${error.name}: ${error.message}`);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please refresh your token.",
                code: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again."
        });
    }
};

module.exports = protect;
