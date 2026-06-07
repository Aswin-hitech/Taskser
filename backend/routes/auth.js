const express = require("express");
const router = express.Router();
const User = require("../models/User");
const protect = require("../middleware/protect");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require("../utils/authUtils");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/"
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    const user = new User({ username, password });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    if (!accessToken || !refreshToken) {
      throw new Error("JWT generation failed");
    }

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, accessToken });
  } catch (err) {
    console.error("[REGISTER ERROR]", err.message);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, accessToken });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});


// REFRESH TOKEN
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const accessToken = generateAccessToken(user);
    res.json({ success: true, accessToken });
  } catch (error) {
    console.error("[REFRESH ERROR]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, message: "Logged out successfully" });
});


// ME (Protected Route)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
