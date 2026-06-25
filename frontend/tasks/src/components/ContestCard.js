const formatDateTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const formatTimeRemaining = (startTime, now) => {
  const diffMs = new Date(startTime).getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Started";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const reminderLabels = {
  1440: "24h",
  60: "1h",
  15: "15m",
};

export default function ContestCard({
  contest,
  now,
  onToggleFavorite,
  onToggleReminder,
  onAddContestReminder,
  saving,
}) {
  return (
    <article className="contest-card">
      <div className="contest-card-top">
        <div>
          <div className="contest-platform-row">
            <span className={`contest-platform platform-${contest.platform}`}>
              {contest.platform}
            </span>
            <span className="contest-time-remaining">
              Starts in {formatTimeRemaining(contest.startTime, now)}
            </span>
          </div>
          <h3 className="contest-title">{contest.title}</h3>
        </div>

        <button
          type="button"
          className={`contest-favorite-btn ${contest.isFavorite ? "is-active" : ""}`}
          onClick={() => onToggleFavorite(contest)}
          disabled={saving}
        >
          {contest.isFavorite ? "Favorited" : "Favorite"}
        </button>
      </div>

      <div className="contest-meta-grid">
        <div>
          <span className="contest-meta-label">Starts</span>
          <strong>{formatDateTime(contest.startTime)}</strong>
        </div>
        <div>
          <span className="contest-meta-label">Duration</span>
          <strong>{formatDuration(contest.durationMinutes)}</strong>
        </div>
      </div>

      <div className="contest-reminders">
        {Object.entries(reminderLabels).map(([offset, label]) => {
          const isEnabled = contest.reminderOffsets.includes(Number(offset));

          return (
            <button
              key={offset}
              type="button"
              className={`contest-reminder-chip ${isEnabled ? "is-active" : ""}`}
              onClick={() => onToggleReminder(contest, Number(offset))}
              disabled={saving}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={contest.isScheduled ? "contest-schedule-btn is-active" : "contest-schedule-btn"}
        onClick={() => onAddContestReminder(contest)}
        disabled={saving}
      >
        {contest.isScheduled ? "Saved to reminders" : "Add Contest & Remind Me"}
      </button>

      <a
        className="contest-link"
        href={contest.url}
        target="_blank"
        rel="noreferrer"
      >
        Open contest
      </a>
    </article>
  );
}
