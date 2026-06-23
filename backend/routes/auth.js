const express = require("express");
const User = require("../models/User");
const Task = require("../models/Task");
const Note = require("../models/Note");
const Notification = require("../models/Notification");
const Checklist = require("../models/CheckList");
const protect = require("../middleware/protect");
const config = require("../config/env");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
  getRefreshCookieOptions,
} = require("../utils/authUtils");
const {
  normalizeUsername,
  validateUsername,
  validatePassword,
} = require("../utils/validation");

const router = express.Router();

const issueAuthTokens = async (res, user, rememberMe = true) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, rememberMe);

  if (!accessToken || !refreshToken) {
    throw new Error("JWT generation failed");
  }

  user.refreshTokenHash = await hashRefreshToken(refreshToken);
  await user.save();

  res.cookie(config.cookieName, refreshToken, getRefreshCookieOptions(rememberMe));

  return accessToken;
};

router.post("/register", async (req, res) => {
  try {
    const { username, password, rememberMe = true } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const usernameError = validateUsername(normalizedUsername);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      return res.status(400).json({
        success: false,
        message: usernameError || passwordError,
      });
    }

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const user = new User({ username: normalizedUsername, password });
    await user.save();

    const accessToken = await issueAuthTokens(res, user, Boolean(rememberMe));

    return res.status(201).json({
      success: true,
      accessToken,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error("[REGISTER ERROR]", err.message);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password, rememberMe = true } = req.body;
    const normalizedUsername = normalizeUsername(username);

    const user = await User.findOne({ username: normalizedUsername }).select(
      "+password +refreshTokenHash"
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = await issueAuthTokens(res, user, Boolean(rememberMe));

    return res.json({
      success: true,
      accessToken,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies[config.cookieName];

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    res.clearCookie(config.cookieName, getRefreshCookieOptions());
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }

  try {
    const user = await User.findById(decoded.id).select("+refreshTokenHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tokenMatches = await compareRefreshToken(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      res.clearCookie(config.cookieName, getRefreshCookieOptions());
      return res.status(403).json({ success: false, message: "Refresh token revoked" });
    }

    const accessToken = await issueAuthTokens(res, user, Boolean(decoded.rememberMe));
    return res.json({
      success: true,
      accessToken,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("[REFRESH ERROR]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies[config.cookieName];

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
      }
    }

    res.clearCookie(config.cookieName, getRefreshCookieOptions());
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -refreshTokenHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/account", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const password = req.body?.password;
    if (!password || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Password is incorrect" });
    }

    await Promise.all([
      Task.deleteMany({ user: req.userId }),
      Note.deleteMany({ user: req.userId }),
      Notification.deleteMany({ user: req.userId }),
      Checklist.deleteMany({ user: req.userId }),
      User.deleteOne({ _id: req.userId }),
    ]);

    res.clearCookie(config.cookieName, getRefreshCookieOptions());
    return res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Account deletion failed" });
  }
});

module.exports = router;
