import { useState, useContext } from "react";
import { TaskContext } from "../context/TaskContext";

export default function AddTaskForm() {
  const { addTask } = useContext(TaskContext);

  const [description, setDescription] = useState("");
  const [type, setType] = useState("daily");

  // For scheduled tasks
  const [hasDate, setHasDate] = useState(false);
  const [date, setDate] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [time, setTime] = useState("");

  // For daily habits
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    await addTask({
      description,
      type,

      // Scheduled task data
      date: type === "scheduled" && hasDate ? date : undefined,
      time: type === "scheduled" && hasTime ? time : undefined, // ADD THIS

      // Daily habit reminder
      reminder: type === "daily" ? reminder : false,
      reminderTime: type === "daily" && reminder ? reminderTime : undefined,
    });

    // Reset form
    setDescription("");
    setHasDate(false);
    setDate("");
    setHasTime(false);
    setTime("");
    setReminder(false);
    setReminderTime("");
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      {/* TASK DESCRIPTION */}
      <input
        type="text"
        placeholder="What needs to be done?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      {/* TASK TYPE */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="daily">Daily / Habit</option>
        <option value="scheduled">Scheduled / Event</option>
      </select>

      {/* DAILY REMINDER */}
      {type === "daily" && (
        <div className="task-options-row">
          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
            />
            <span>Enable reminder</span>
          </label>

          <div className="task-option">
            <label>Reminder time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={!reminder}
            />
          </div>
        </div>
      )}

      {/* SCHEDULED TASK */}
      {type === "scheduled" && (
        <div className="task-options-row">
          {/* DATE */}
          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={hasDate}
              onChange={(e) => setHasDate(e.target.checked)}
            />
            <span>Add due date</span>
          </label>

          <div className="task-option">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!hasDate}
            />
          </div>

          {/* TIME */}
          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={hasTime}
              onChange={(e) => setHasTime(e.target.checked)}
            />
            <span>Add time</span>
          </label>

          <div className="task-option">
            <label>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!hasTime}
            />
          </div>
        </div>
      )}

      <button type="submit" disabled={isAdding}>
        {isAdding ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}