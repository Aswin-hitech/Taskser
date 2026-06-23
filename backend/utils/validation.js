const { isValidObjectId } = require("mongoose");
const validator = require("validator");

const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
};

const sanitizeMultilineText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
};

const normalizeUsername = (value) => sanitizeText(value).toLowerCase();

const validateUsername = (value) => {
  const username = normalizeUsername(value);

  if (!validator.isLength(username, { min: 3, max: 30 })) {
    return "Username must be between 3 and 30 characters.";
  }

  if (!validator.matches(username, /^[a-z0-9_]+$/)) {
    return "Username can contain only lowercase letters, numbers, and underscores.";
  }

  return null;
};

const validatePassword = (value) => {
  if (typeof value !== "string" || value.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
};

const validateObjectIdParam = (value, label = "Resource") => {
  if (!isValidObjectId(value)) {
    return `${label} id is invalid.`;
  }

  return null;
};

const normalizeDateInput = (value) => {
  if (!value) return null;
  if (
    typeof value !== "string" ||
    !validator.matches(value, /^\d{4}-\d{2}-\d{2}$/)
  ) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
};

const normalizeTimeInput = (value) => {
  if (!value) return null;
  if (typeof value !== "string" || !validator.matches(value, /^\d{2}:\d{2}$/)) {
    return null;
  }

  return value;
};

module.exports = {
  sanitizeText,
  sanitizeMultilineText,
  normalizeUsername,
  validateUsername,
  validatePassword,
  validateObjectIdParam,
  normalizeDateInput,
  normalizeTimeInput,
};
