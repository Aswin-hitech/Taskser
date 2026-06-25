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
  const [dayNames, setDayNames] = useState([]);
  const [notificationMinutesBefore, setNotificationMinutesBefore] = useState(10);
  const [weeklyRecurrence, setWeeklyRecurrence] = useState(true);
  const [customRepeatRules, setCustomRepeatRules] = useState("");
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
      time: type === "scheduled" && hasTime ? time : type === "daily" ? time : undefined,
      dayNames: type === "daily" ? dayNames : [],
      notificationMinutesBefore,
      weeklyRecurrence: type === "daily" ? weeklyRecurrence : false,
      customRepeatRules: type === "daily" ? customRepeatRules : "",
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
    setDayNames([]);
    setNotificationMinutesBefore(10);
    setWeeklyRecurrence(true);
    setCustomRepeatRules("");
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
        <div className="task-options-row habit-options">
          <label className="task-option">
            <span>Time</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </label>

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

          <label className="task-option">
            <span>Notify before event</span>
            <select
              value={notificationMinutesBefore}
              onChange={(event) => setNotificationMinutesBefore(Number(event.target.value))}
            >
              <option value={0}>At event time</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </select>
          </label>

          <label className="task-option checkbox-option">
            <input
              type="checkbox"
              checked={weeklyRecurrence}
              onChange={(event) => setWeeklyRecurrence(event.target.checked)}
            />
            <span>Repeat weekly</span>
          </label>

          <label className="task-option full-width">
            <span>Day names</span>
            <div className="day-picker">
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <button
                  key={day}
                  type="button"
                  className={dayNames.includes(day) ? "day-chip is-active" : "day-chip"}
                  onClick={() =>
                    setDayNames((current) =>
                      current.includes(day)
                        ? current.filter((item) => item !== day)
                        : [...current, day]
                    )
                  }
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </label>

          <label className="task-option full-width">
            <span>Custom repeat rules</span>
            <input
              type="text"
              placeholder="Example: first weekday, alternate Saturdays"
              value={customRepeatRules}
              onChange={(event) => setCustomRepeatRules(event.target.value)}
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
