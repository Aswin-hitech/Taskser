import axios from "axios";
import notificationSound from "./notificationSound"; // Import the sound utility

// Create axios instance for notifications
const notificationAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// Add auth token to requests
notificationAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function processNotifications(tasks) {
  console.log("🔔 processNotifications called with", tasks.length, "tasks");
  
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.log("❌ Browser doesn't support notifications");
    return;
  }

  // Request permission if needed
  if (Notification.permission === "default") {
    console.log("📋 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("📋 Notification permission:", permission);
  }

  if (Notification.permission !== "granted") {
    console.log("❌ Notification permission not granted");
    return;
  }

  const now = new Date();
  console.log("🕒 Current time:", now.toLocaleString());

  for (const task of tasks) {
    console.log(`\n📋 Processing task: ${task.description}`);
    console.log("  Type:", task.type);
    console.log("  Completed:", task.completed);
    
    // Skip completed tasks
    if (task.completed) {
      console.log("  ⏭️ Skipping - task completed");
      continue;
    }

    // For scheduled tasks with date
    if (task.type === "scheduled" && task.date) {
      console.log("  📅 Scheduled task with date:", task.date);
      console.log("  ⏰ Task time:", task.time || "No time specified");
      
      const dueDate = new Date(task.date);
      
      // If time is provided, combine with date
      if (task.time) {
        const [hours, minutes] = task.time.split(":").map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
      }
      
      console.log("  📅 Due date/time:", dueDate.toLocaleString());
      
      const diffMs = dueDate - now;
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      
      console.log("  ⏳ Time until due:", diffHours, "hours", diffMinutes % 60, "minutes");
      
      let type = null;
      let message = "";

      // ⏰ 24 HOURS BEFORE (23-24 hours)
      if (diffHours <= 24 && diffHours > 23) {
        type = "due_24h";
        message = `${task.description} is due in 24 hours`;
        console.log("  🔔 Trigger: 24-hour reminder");
      }
      // ⏰ 5 HOURS BEFORE (4-5 hours)
      else if (diffHours <= 5 && diffHours > 4) {
        type = "due_5h";
        message = `${task.description} is due in 5 hours`;
        console.log("  🔔 Trigger: 5-hour reminder");
      }
      // ⏰ 5 MINUTES BEFORE (4-5 minutes)
      else if (diffMinutes <= 5 && diffMinutes > 4) {
        type = "due_5m";
        message = `${task.description} is due in 5 minutes`;
        console.log("  🔔 Trigger: 5-minute reminder");
      }
      // ⏰ EXACT DUE TIME (±1 min)
      else if (diffMinutes >= -1 && diffMinutes <= 1) {
        type = "due_now";
        message = `${task.description} is due now`;
        console.log("  🔔 Trigger: Due now");
      }
      // ❌ OVERDUE (> 1 minute late)
      else if (diffMinutes < -1 && diffMinutes > -60) {
        type = "overdue";
        message = `${task.description} is overdue by ${Math.abs(diffMinutes)} minutes`;
        console.log("  🔔 Trigger: Overdue");
      }

      // 🔔 Send notification if type is set
      if (type) {
        console.log("  🎯 Creating notification:", type);
        
        try {
          // Play notification sound
          notificationSound.play(type);
          console.log("  🔊 Playing notification sound");
          
          // Browser notification
          const notification = new Notification("TaskFlow Reminder", {
            body: message,
            icon: "/favicon.ico",
            tag: `task-${task._id}-${type}-${Date.now()}`,
          });
          
          console.log("  ✅ Browser notification created");
          
          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Save to backend
          try {
            console.log("  💾 Saving to backend...");
            const response = await notificationAPI.post("/api/notifications", {
              taskId: task._id,
              type,
              message,
            });
            console.log("  ✅ Saved to backend:", response.data);
          } catch (err) {
            console.error("  ❌ Failed to save notification:", err.response?.data || err.message);
          }
        } catch (err) {
          console.error("  ❌ Failed to create browser notification:", err);
        }
      } else {
        console.log("  ⏭️ No notification triggered for this task");
      }
    }

    // 🔔 Daily habit reminders
    if (task.type === "daily" && task.reminder && task.reminderTime) {
      console.log("  🔔 Daily habit with reminder:", task.reminderTime);
      
      const now = new Date();
      const [reminderHour, reminderMinute] = task.reminderTime.split(":").map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      console.log(`  🕒 Current time: ${currentHour}:${currentMinute}`);
      console.log(`  ⏰ Reminder time: ${reminderHour}:${reminderMinute}`);
      
      // Check if it's reminder time (±1 minute)
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (reminderHour * 60 + reminderMinute));
      
      if (timeDiff <= 1) {
        console.log("  🎯 It's reminder time!");
        
        // Check if not already logged today
        const today = now.toISOString().split("T")[0];
        const hasLoggedToday = task.habitLogs && task.habitLogs.includes(today);
        
        console.log("  📅 Today:", today);
        console.log("  ✅ Already logged today?", hasLoggedToday);
        
        if (!hasLoggedToday) {
          const message = `Reminder: ${task.description}`;
          
          try {
            // Play notification sound
            notificationSound.play("reminder");
            console.log("  🔊 Playing reminder sound");
            
            // Browser notification
            new Notification("Daily Habit Reminder", {
              body: message,
              icon: "/favicon.ico",
              tag: `habit-${task._id}-${today}`,
            });
            
            console.log("  ✅ Daily habit notification created");
            
            // Save to backend
            try {
              const response = await notificationAPI.post("/api/notifications", {
                taskId: task._id,
                type: "reminder",
                message,
              });
              console.log("  ✅ Daily notification saved:", response.data);
            } catch (err) {
              console.error("  ❌ Failed to save daily notification:", err);
            }
          } catch (err) {
            console.error("  ❌ Failed to create daily notification:", err);
          }
        } else {
          console.log("  ⏭️ Already logged today, skipping notification");
        }
      } else {
        console.log(`  ⏭️ Not reminder time (diff: ${timeDiff} minutes)`);
      }
    }
  }
  
  console.log("🔔 Finished processing all tasks");
}

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("❌ Browser doesn't support notifications");
    return Promise.resolve(false);
  }

  if (Notification.permission === "granted") {
    console.log("✅ Notifications already granted");
    return Promise.resolve(true);
  }

  if (Notification.permission === "denied") {
    console.log("❌ Notification permission denied");
    return Promise.resolve(false);
  }

  console.log("📋 Requesting notification permission...");
  return Notification.requestPermission().then(permission => {
    console.log("📋 Permission result:", permission);
    return permission === "granted";
  });
}

// Export sound controller for Settings page
export { notificationSound };
