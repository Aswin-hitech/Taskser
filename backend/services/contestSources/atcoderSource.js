const cheerio = require("cheerio");
const normalizeContest = require("../normalizeContest");

const ATCODER_CONTESTS_URL = "https://atcoder.jp/contests/";

const parseDurationMinutes = (durationText) => {
  const [hours, minutes] = durationText.split(":").map((value) => Number(value));
  return hours * 60 + minutes;
};

const fetchAtCoderContests = async () => {
  const response = await fetch(ATCODER_CONTESTS_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "TaskserContestTracker/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`AtCoder responded with ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const upcomingHeading = $("h3")
    .filter((_, element) => $(element).text().trim() === "Upcoming Contests")
    .first();

  if (!upcomingHeading.length) {
    throw new Error("Could not locate AtCoder upcoming contests table.");
  }

  const contests = [];
  const rows = upcomingHeading.nextAll(".panel").first().find("tbody tr");

  rows.each((_, row) => {
    const columns = $(row).find("td");
    const timeText = columns.eq(0).find("time").text().trim();
    const titleLink = columns.eq(1).find("a").last();
    const durationText = columns.eq(2).text().trim();

    if (!timeText || !titleLink.length || !durationText) {
      return;
    }

    contests.push(
      normalizeContest({
        platform: "atcoder",
        externalId: titleLink.attr("href").split("/").pop(),
        title: titleLink.text().trim(),
        startTime: new Date(timeText),
        durationMinutes: parseDurationMinutes(durationText),
        url: `https://atcoder.jp${titleLink.attr("href")}`,
        source: "atcoder_contests_page",
        raw: {
          timeText,
          durationText,
        },
      })
    );
  });

  return contests;
};

module.exports = fetchAtCoderContests;
