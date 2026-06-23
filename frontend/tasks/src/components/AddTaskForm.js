import { useContext, useState } from "react";
import { TaskContext } from "../context/TaskContext";

export default function AddTaskForm() {
  const { addTask } = useContext(TaskContext);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("daily");
  const [hasDate, setHasDate] = useState(false);
  const [date, setDate] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = await addTask({
      description,
      type,
      date: type === "scheduled" && hasDate ? date : undefined,
      time: type === "scheduled" && hasTime ? time : undefined,
      reminder: type === "daily" ? reminder : false,
      reminderTime: type === "daily" && reminder ? reminderTime : undefined,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

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
      <div className="section-header">
        <h2>Add something new</h2>
      </div>

      <label className="field-group">
        <span>Description</span>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </label>

      <label className="field-group">
        <span>Task type</span>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="daily">Daily habit</option>
          <option value="scheduled">Scheduled task</option>
        </select>
      </label>

      {type === "daily" && (
        <div className="task-options-row">
          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={reminder}
              onChange={(event) => setReminder(event.target.checked)}
            />
            <span>Enable daily reminder</span>
          </label>

          <label className="task-option">
            <span>Reminder time</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              disabled={!reminder}
            />
          </label>
        </div>
      )}

      {type === "scheduled" && (
        <div className="task-options-row">
          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={hasDate}
              onChange={(event) => setHasDate(event.target.checked)}
            />
            <span>Add due date</span>
          </label>

          <label className="task-option">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={!hasDate}
            />
          </label>

          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={hasTime}
              onChange={(event) => setHasTime(event.target.checked)}
            />
            <span>Add time</span>
          </label>

          <label className="task-option">
            <span>Time</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              disabled={!hasTime}
            />
          </label>
        </div>
      )}

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit">Add Task</button>
    </form>
  );
}
