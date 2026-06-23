const normalizeContest = ({
  platform,
  externalId,
  title,
  startTime,
  durationMinutes,
  url,
  source,
  raw,
}) => {
  const safeStartTime = new Date(startTime);
  const safeDurationMinutes = Number(durationMinutes);

  return {
    platform,
    externalId,
    title: String(title).trim(),
    startTime: safeStartTime,
    endTime: new Date(safeStartTime.getTime() + safeDurationMinutes * 60 * 1000),
    durationMinutes: safeDurationMinutes,
    url,
    source,
    raw,
  };
};

module.exports = normalizeContest;
