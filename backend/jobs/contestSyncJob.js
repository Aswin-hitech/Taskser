const cron = require("node-cron");
const config = require("../config/env");
const {
  processContestReminders,
  syncContests,
} = require("../services/contestService");

const startContestJobs = () => {
  cron.schedule(config.contestSyncCron, async () => {
    try {
      await syncContests();
    } catch (error) {
      console.error("[CONTEST SYNC JOB]", error.message);
    }
  });

  cron.schedule(config.contestReminderCron, async () => {
    try {
      await processContestReminders();
    } catch (error) {
      console.error("[CONTEST REMINDER JOB]", error.message);
    }
  });
};

module.exports = startContestJobs;
