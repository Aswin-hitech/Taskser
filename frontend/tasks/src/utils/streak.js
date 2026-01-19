export const calculateStreak = (logs = []) => {
  let streak = 0;
  const today = new Date();

  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    if (logs.includes(dateStr)) streak++;
    else break;
  }

  return streak;
};
