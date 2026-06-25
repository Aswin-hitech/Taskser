const DailyQuote = require("../models/DailyQuote");
const config = require("../config/env");

const quoteEmojis = {
  attitude: ":sun:",
  dreams: ":rocket:",
  happiness: ":sparkles:",
  inspiration: ":sparkles:",
  learning: ":books:",
  success: ":trophy:",
};

const dateKeyForToday = () => new Date().toISOString().slice(0, 10);

const fetchNinjaQuote = async () => {
  if (!config.ninjaQuotesApiKey) {
    throw new Error("NINJA_QUOTES_API_KEY is missing.");
  }

  const response = await fetch("https://api.api-ninjas.com/v1/quotes", {
    headers: {
      "X-Api-Key": config.ninjaQuotesApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Ninja Quotes API failed with status ${response.status}.`);
  }

  const data = await response.json();
  const item = Array.isArray(data) ? data[0] : data;

  if (!item?.quote) {
    throw new Error("Ninja Quotes API returned an empty quote.");
  }

  const category = item.category || "inspiration";
  return {
    quote: item.quote,
    author: item.author || "Unknown",
    category,
    emoji: quoteEmojis[category] || quoteEmojis.inspiration,
  };
};

const getDailyQuote = async () => {
  const dateKey = dateKeyForToday();
  const cached = await DailyQuote.findOne({ dateKey }).lean();

  if (cached) {
    return { ...cached, cached: true };
  }

  const quote = await fetchNinjaQuote();
  const saved = await DailyQuote.findOneAndUpdate(
    { dateKey },
    { $setOnInsert: { dateKey, ...quote } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return { ...saved, cached: false };
};

module.exports = {
  getDailyQuote,
};
