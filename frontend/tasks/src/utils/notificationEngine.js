import api from "../context/api";
import notificationSound from "./notificationSound";

const createBrowserNotification = (title, body, tag) => {
  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

const getScheduledNotificationPayload = (task, now) => {
  if (task.type !== "scheduled" || !task.date || task.completed) {
    return null;
  }

  const dueDate = new Date(task.date);
  if (task.time) {
    const [hours, minutes] = task.time.split(":").map(Number);
    dueDate.setUTCHours(hours, minutes, 0, 0);
  }

  const diffMinutes = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60));
  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours <= 24 && diffHours > 23) {
    return { type: "due_24h", message: `${task.description} is due in 24 hours` };
  }

  if (diffHours <= 5 && diffHours > 4) {
    return { type: "due_5h", message: `${task.description} is due in 5 hours` };
  }

  if (diffMinutes <= 5 && diffMinutes > 4) {
    return { type: "due_5m", message: `${task.description} is due in 5 minutes` };
  }

  if (diffMinutes >= -1 && diffMinutes <= 1) {
    return { type: "due_now", message: `${task.description} is due now` };
  }

  if (diffMinutes < -1 && diffMinutes > -60) {
    return {
      type: "overdue",
      message: `${task.description} is overdue by ${Math.abs(diffMinutes)} minutes`,
    };
  }

  return null;
};

const shouldSendDailyReminder = (task, now) => {
  if (task.type !== "daily" || !task.reminder || !task.reminderTime) {
    return false;
  }

  const [reminderHour, reminderMinute] = task.reminderTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const reminderMinutes = reminderHour * 60 + reminderMinute;
  const today = now.toISOString().split("T")[0];
  const hasLoggedToday = task.habitLogs?.includes(today);

  return Math.abs(currentMinutes - reminderMinutes) <= 1 && !hasLoggedToday;
};

export async function processNotifications(tasks) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const now = new Date();

  for (const task of tasks) {
    const scheduledPayload = getScheduledNotificationPayload(task, now);

    if (scheduledPayload) {
      notificationSound.play(scheduledPayload.type);
      createBrowserNotification("Taskser Reminder", scheduledPayload.message, `task-${task._id}-${scheduledPayload.type}`);

      try {
        await api.post("/api/notifications", {
          taskId: task._id,
          type: scheduledPayload.type,
          message: scheduledPayload.message,
        });
      } catch (error) {
        console.error("Failed to save scheduled notification", error);
      }
    }

    if (shouldSendDailyReminder(task, now)) {
      const message = `Reminder: ${task.description}`;
      notificationSound.play("reminder");
      createBrowserNotification("Daily Habit Reminder", message, `habit-${task._id}-${now.toISOString().split("T")[0]}`);

      try {
        await api.post("/api/notifications", {
          taskId: task._id,
          type: "reminder",
          message,
        });
      } catch (error) {
        console.error("Failed to save daily notification", error);
      }
    }
  }
}

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return Promise.resolve(false);
  }

  if (Notification.permission === "granted") {
    return Promise.resolve(true);
  }

  if (Notification.permission === "denied") {
    return Promise.resolve(false);
  }

  return Notification.requestPermission().then((permission) => permission === "granted");
}

export { notificationSound };
