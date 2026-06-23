const normalizeContest = require("../normalizeContest");

const COMPETE_API_URL = "https://competeapi.vercel.app/contests/upcoming/";

const PLATFORM_MAP = {
  leetcode: "leetcode",
  codechef: "codechef",
};

const fetchCompeteApiContests = async () => {
  const response = await fetch(COMPETE_API_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TaskserContestTracker/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Compete API responded with ${response.status}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("Unexpected Compete API response.");
  }

  return payload
    .filter((contest) => PLATFORM_MAP[contest.site])
    .map((contest) =>
      normalizeContest({
        platform: PLATFORM_MAP[contest.site],
        externalId: `${contest.site}:${contest.url.split("/").filter(Boolean).pop()}`,
        title: contest.title,
        startTime: new Date(contest.startTime),
        durationMinutes: Math.max(1, Math.round(contest.duration / (1000 * 60))),
        url: contest.url,
        source: "compete_api",
        raw: contest,
      })
    );
};

module.exports = fetchCompeteApiContests;
