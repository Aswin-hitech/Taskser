const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const Task = require("../models/Task");
const Note = require("../models/Note");
const Notification = require("../models/Notification");
const Checklist = require("../models/CheckList");
const { canSendEmail, sendPasswordResetEmail } = require("../utils/mailer");
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
  normalizeEmail,
  validateUsername,
  validateEmail,
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
    const { username, email, password, rememberMe = true } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const usernameError = validateUsername(normalizedUsername);
    const emailError = validateEmail(normalizedEmail);
    const passwordError = validatePassword(password);

    if (usernameError || emailError || passwordError) {
      return res.status(400).json({
        success: false,
        message: usernameError || emailError || passwordError,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });
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

router.post("/forgot-password", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const emailError = validateEmail(normalizedEmail);

    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetTokenHash +passwordResetExpiresAt"
    );

    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a reset link has been prepared.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const resetUrl = `${config.frontendAppUrl}/reset-password/${rawToken}`;

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetUrl,
    });

    return res.json({
      success: true,
      message: emailSent
        ? "If that email exists, a reset link has been sent."
        : "Reset link generated.",
      ...(emailSent || config.isProduction ? {} : { resetUrl }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const passwordError = validatePassword(req.body.password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+password +refreshTokenHash +passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    user.password = req.body.password;
    user.refreshTokenHash = null;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.clearCookie(config.cookieName, getRefreshCookieOptions());

    return res.json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
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
