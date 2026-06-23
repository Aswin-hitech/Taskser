const Contest = require("../models/Contest");
const ContestPreference = require("../models/ContestPreference");
const ContestSyncState = require("../models/ContestSyncState");
const Notification = require("../models/Notification");
const fetchCodeforcesContests = require("./contestSources/codeforcesSource");
const fetchAtCoderContests = require("./contestSources/atcoderSource");
const fetchCompeteApiContests = require("./contestSources/competeApiSource");

const DEFAULT_REMINDER_OFFSETS = [1440, 60, 15];
let syncInFlight = null;

const sortByStartTime = (contests) =>
  contests.sort((left, right) => left.startTime.getTime() - right.startTime.getTime());

const dedupeContests = (contests) => {
  const uniqueContests = new Map();

  contests.forEach((contest) => {
    uniqueContests.set(`${contest.platform}:${contest.externalId}`, contest);
  });

  return [...uniqueContests.values()];
};

const fetchContestSources = async () => {
  const settled = await Promise.allSettled([
    fetchCodeforcesContests(),
    fetchAtCoderContests(),
    fetchCompeteApiContests(),
  ]);

  const [codeforcesResult, atcoderResult, competeApiResult] = settled;
  const sourceStatuses = {
    codeforces: {
      ok: codeforcesResult.status === "fulfilled",
      count: codeforcesResult.status === "fulfilled" ? codeforcesResult.value.length : 0,
      error:
        codeforcesResult.status === "rejected" ? codeforcesResult.reason.message : "",
    },
    atcoder: {
      ok: atcoderResult.status === "fulfilled",
      count: atcoderResult.status === "fulfilled" ? atcoderResult.value.length : 0,
      error: atcoderResult.status === "rejected" ? atcoderResult.reason.message : "",
    },
    competeApi: {
      ok: competeApiResult.status === "fulfilled",
      count: competeApiResult.status === "fulfilled" ? competeApiResult.value.length : 0,
      error:
        competeApiResult.status === "rejected" ? competeApiResult.reason.message : "",
    },
  };

  const fetchedContests = [
    ...(codeforcesResult.status === "fulfilled" ? codeforcesResult.value : []),
    ...(atcoderResult.status === "fulfilled" ? atcoderResult.value : []),
    ...(competeApiResult.status === "fulfilled" ? competeApiResult.value : []),
  ];

  return {
    fetchedContests: sortByStartTime(dedupeContests(fetchedContests)),
    sourceStatuses,
  };
};

const syncContests = async () => {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    const now = new Date();
    const syncState =
      (await ContestSyncState.findOne({ key: "global" })) ||
      new ContestSyncState({ key: "global" });

    syncState.lastAttemptAt = now;

    try {
      const { fetchedContests, sourceStatuses } = await fetchContestSources();

      if (fetchedContests.length === 0) {
        throw new Error("No contest data fetched from any source.");
      }

      await Promise.all(
        fetchedContests.map((contest) =>
          Contest.findOneAndUpdate(
            { platform: contest.platform, externalId: contest.externalId },
            { ...contest, lastSyncedAt: now },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          )
        )
      );

      await Contest.deleteMany({
        startTime: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      });

      const sourceFailures = Object.values(sourceStatuses).filter((status) => !status.ok);

      syncState.lastSuccessAt = now;
      syncState.lastStatus = sourceFailures.length > 0 ? "partial_failure" : "success";
      syncState.sourceStatuses = sourceStatuses;
      syncState.lastError =
        sourceFailures.length > 0
          ? sourceFailures.map((status) => status.error).filter(Boolean).join(" | ")
          : "";
      await syncState.save();

      return {
        status: syncState.lastStatus,
        sourceStatuses,
      };
    } catch (error) {
      syncState.lastStatus = "failure";
      syncState.lastError = error.message;
      await syncState.save();
      throw error;
    } finally {
      syncInFlight = null;
    }
  })();

  return syncInFlight;
};

const getContestList = async ({ userId, platform, sort, favoritesOnly }) => {
  const query = {
    startTime: { $gte: new Date() },
  };

  if (platform && platform !== "all") {
    query.platform = platform;
  }

  const contests = await Contest.find(query).sort({
    startTime: sort === "date_desc" ? -1 : 1,
  });

  const preferences = userId
    ? await ContestPreference.find({
        user: userId,
        contest: { $in: contests.map((contest) => contest._id) },
      }).lean()
    : [];

  const preferenceMap = new Map(
    preferences.map((preference) => [String(preference.contest), preference])
  );

  const mergedContests = contests
    .map((contest) => {
      const preference = preferenceMap.get(String(contest._id));
      return {
        ...contest.toObject(),
        isFavorite: Boolean(preference?.isFavorite),
        reminderOffsets:
          preference?.reminderOffsets?.length > 0
            ? preference.reminderOffsets
            : [],
      };
    })
    .filter((contest) => (favoritesOnly ? contest.isFavorite : true));

  const syncState = await ContestSyncState.findOne({ key: "global" }).lean();

  return {
    contests: mergedContests,
    sync: syncState || null,
  };
};

const updateContestPreference = async ({ userId, contestId, isFavorite, reminderOffsets }) => {
  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new Error("Contest not found.");
  }

  const sanitizedOffsets = Array.isArray(reminderOffsets)
    ? [...new Set(reminderOffsets.map(Number))].filter((offset) =>
        DEFAULT_REMINDER_OFFSETS.includes(offset)
      )
    : undefined;

  const preference = await ContestPreference.findOneAndUpdate(
    { user: userId, contest: contestId },
    {
      $set: {
        ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
        ...(sanitizedOffsets ? { reminderOffsets: sanitizedOffsets } : {}),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    ...contest.toObject(),
    isFavorite: preference.isFavorite,
    reminderOffsets: preference.reminderOffsets,
  };
};

const processContestReminders = async () => {
  const now = new Date();
  const upperBound = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 1000);

  const preferences = await ContestPreference.find({
    reminderOffsets: { $in: DEFAULT_REMINDER_OFFSETS },
  }).populate("contest");

  for (const preference of preferences) {
    const contest = preference.contest;

    if (!contest || contest.startTime <= now || contest.startTime > upperBound) {
      continue;
    }

    for (const offset of preference.reminderOffsets) {
      if (preference.sentReminderOffsets.includes(offset)) {
        continue;
      }

      const diffMinutes = Math.round(
        (contest.startTime.getTime() - now.getTime()) / (1000 * 60)
      );

      if (diffMinutes <= offset && diffMinutes > offset - 1) {
        const label = offset === 1440 ? "24 hours" : offset === 60 ? "1 hour" : "15 minutes";
        const message = `${contest.title} on ${contest.platform} starts in ${label}.`;

        await Notification.findOneAndUpdate(
          {
            user: preference.user,
            contest: contest._id,
            type:
              offset === 1440
                ? "contest_24h"
                : offset === 60
                  ? "contest_1h"
                  : "contest_15m",
          },
          {
            $setOnInsert: {
              user: preference.user,
              contest: contest._id,
              type:
                offset === 1440
                  ? "contest_24h"
                  : offset === 60
                    ? "contest_1h"
                    : "contest_15m",
              message,
            },
          },
          { upsert: true, new: true }
        );

        preference.sentReminderOffsets = [...preference.sentReminderOffsets, offset];
        await preference.save();
      }
    }
  }
};

module.exports = {
  DEFAULT_REMINDER_OFFSETS,
  syncContests,
  getContestList,
  updateContestPreference,
  processContestReminders,
};
