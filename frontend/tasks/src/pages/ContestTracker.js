import { useEffect, useMemo, useState } from "react";
import api from "../context/api";
import ContestCard from "../components/ContestCard";

const platformOptions = ["all", "leetcode", "codeforces", "codechef", "atcoder"];
const sortOptions = [
  { value: "date_asc", label: "Soonest first" },
  { value: "date_desc", label: "Latest first" },
];

export default function ContestTracker() {
  const [contests, setContests] = useState([]);
  const [sync, setSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sortOrder, setSortOrder] = useState("date_asc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [now, setNow] = useState(new Date());
  const [savingContestIds, setSavingContestIds] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchContests();
  }, [selectedPlatform, sortOrder, favoritesOnly]);

  const nextContest = useMemo(() => contests[0] || null, [contests]);

  const fetchContests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/contests", {
        params: {
          platform: selectedPlatform,
          sort: sortOrder,
          favoritesOnly,
        },
      });

      setContests(response.data.contests || []);
      setSync(response.data.sync || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load contests.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await api.post("/api/contests/refresh");
      await fetchContests();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Refresh failed, showing cached contests instead."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const updateContestLocally = (updatedContest) => {
    setContests((currentContests) =>
      currentContests.map((contest) =>
        contest._id === updatedContest._id ? updatedContest : contest
      )
    );
  };

  const withSavingState = async (contestId, action) => {
    setSavingContestIds((currentIds) => [...currentIds, contestId]);
    try {
      await action();
    } finally {
      setSavingContestIds((currentIds) => currentIds.filter((id) => id !== contestId));
    }
  };

  const handleToggleFavorite = async (contest) => {
    await withSavingState(contest._id, async () => {
      const response = await api.put(`/api/contests/${contest._id}/preference`, {
        isFavorite: !contest.isFavorite,
        reminderOffsets: contest.reminderOffsets,
      });

      updateContestLocally(response.data.contest);
    });
  };

  const handleToggleReminder = async (contest, offset) => {
    const reminderOffsets = contest.reminderOffsets.includes(offset)
      ? contest.reminderOffsets.filter((value) => value !== offset)
      : [...contest.reminderOffsets, offset].sort((left, right) => right - left);

    await withSavingState(contest._id, async () => {
      const response = await api.put(`/api/contests/${contest._id}/preference`, {
        isFavorite: contest.isFavorite,
        reminderOffsets,
      });

      updateContestLocally(response.data.contest);
    });
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Contest Tracker</h1>
          <p className="page-subtitle">
            Keep upcoming LeetCode, Codeforces, CodeChef, and AtCoder contests in one place.
          </p>
        </div>

        <div className="stats-overview contest-overview">
          <div className="stat-card">
            <span className="stat-label">Upcoming</span>
            <span className="stat-value">{contests.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Favorites</span>
            <span className="stat-value">
              {contests.filter((contest) => contest.isFavorite).length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Next Contest</span>
            <span className="contest-next-label">
              {nextContest ? nextContest.platform : "None"}
            </span>
          </div>
        </div>
      </div>

      <section className="section contest-toolbar">
        <div className="contest-filter-group">
          <label className="field-group">
            <span>Platform</span>
            <select
              value={selectedPlatform}
              onChange={(event) => setSelectedPlatform(event.target.value)}
            >
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform === "all" ? "All platforms" : platform}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>Sort</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="contest-toolbar-actions">
          <label className="settings-option">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) => setFavoritesOnly(event.target.checked)}
            />
            Favorites only
          </label>

          <button type="button" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh now"}
          </button>
        </div>
      </section>

      {sync?.lastStatus === "partial_failure" || sync?.lastStatus === "failure" ? (
        <div className="notification-warning">
          <p>
            Some contest sources failed during the latest sync. Cached contests are shown while the
            tracker retries in the background.
          </p>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <section className="section contest-list-section">
        <div className="section-header">
          <h2>Upcoming Contests</h2>
          <span className="task-count">{contests.length}</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">C</div>
            <h3>No contests found</h3>
            <p>Try a different filter or refresh the contest sources.</p>
          </div>
        ) : (
          <div className="contest-grid">
            {contests.map((contest) => (
              <ContestCard
                key={contest._id}
                contest={contest}
                now={now}
                onToggleFavorite={handleToggleFavorite}
                onToggleReminder={handleToggleReminder}
                saving={savingContestIds.includes(contest._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
