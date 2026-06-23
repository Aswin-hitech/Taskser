const normalizeContest = require("../normalizeContest");

const CODEFORCES_API_URL = "https://codeforces.com/api/contest.list";

const fetchCodeforcesContests = async () => {
  const response = await fetch(CODEFORCES_API_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TaskserContestTracker/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Codeforces responded with ${response.status}`);
  }

  const payload = await response.json();

  if (payload.status !== "OK" || !Array.isArray(payload.result)) {
    throw new Error("Unexpected Codeforces API response.");
  }

  return payload.result
    .filter((contest) => contest.phase === "BEFORE" && contest.startTimeSeconds)
    .map((contest) =>
      normalizeContest({
        platform: "codeforces",
        externalId: String(contest.id),
        title: contest.name,
        startTime: new Date(contest.startTimeSeconds * 1000),
        durationMinutes: Math.round(contest.durationSeconds / 60),
        url: `https://codeforces.com/contest/${contest.id}`,
        source: "codeforces_api",
        raw: contest,
      })
    );
};

module.exports = fetchCodeforcesContests;
