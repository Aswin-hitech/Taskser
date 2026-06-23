import { useContext, useMemo, useState } from "react";
import { TaskContext } from "../context/TaskContext";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateKeyFromTask = (value) => new Date(value).toISOString().split("T")[0];

export default function Calendar() {
  const { tasks, addTask } = useContext(TaskContext);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskText, setTaskText] = useState("");
  const [error, setError] = useState("");

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const scheduledTasks = useMemo(
    () => tasks.filter((task) => task.type === "scheduled" && task.date),
    [tasks]
  );

  const selectedTasks = useMemo(
    () =>
      selectedDate
        ? scheduledTasks.filter((task) => dateKeyFromTask(task.date) === selectedDate)
        : [],
    [scheduledTasks, selectedDate]
  );

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (month === 0) {
        setMonth(11);
        setYear((currentYear) => currentYear - 1);
      } else {
        setMonth((currentMonth) => currentMonth - 1);
      }
    } else if (month === 11) {
      setMonth(0);
      setYear((currentYear) => currentYear + 1);
    } else {
      setMonth((currentMonth) => currentMonth + 1);
    }
  };

  const hasTaskOnDate = (dateString) =>
    scheduledTasks.some((task) => dateKeyFromTask(task.date) === dateString);

  const handleAddTask = async () => {
    if (!taskText.trim()) return;
    setError("");

    const result = await addTask({
      description: taskText,
      type: "scheduled",
      date: selectedDate,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setTaskText("");
  };

  const todayString = today.toISOString().split("T")[0];

  return (
    <div className="page-container">
      <div className="section calendar-shell">
        <div className="calendar-header">
          <button onClick={() => changeMonth("prev")} type="button">
            Previous
          </button>
          <h1>
            {months[month]} {year}
          </h1>
          <button onClick={() => changeMonth("next")} type="button">
            Next
          </button>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-day-label">
              {day}
            </div>
          ))}

          {Array(firstDay)
            .fill(null)
            .map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty" />
            ))}

          {Array(daysInMonth)
            .fill(null)
            .map((_, index) => {
              const dateString = new Date(Date.UTC(year, month, index + 1, 12))
                .toISOString()
                .split("T")[0];

              return (
                <button
                  key={dateString}
                  className={`calendar-day ${selectedDate === dateString ? "selected" : ""} ${
                    dateString === todayString ? "today" : ""
                  }`}
                  onClick={() => setSelectedDate(dateString)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  {hasTaskOnDate(dateString) ? <span className="calendar-task-dot" /> : null}
                </button>
              );
            })}
        </div>
      </div>

      {selectedDate ? (
        <div className="soft-card wide-section calendar-panel">
          <div className="section-header">
            <h2>{selectedDate}</h2>
            <span className="task-count">{selectedTasks.length}</span>
          </div>

          <div className="calendar-add-task">
            <input
              placeholder="Task description"
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
            />
            <div className="task-actions">
              <button onClick={handleAddTask} type="button">
                Add Task
              </button>
              <button className="secondary" onClick={() => setSelectedDate(null)} type="button">
                Close
              </button>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </div>

          <div className="calendar-task-list">
            {selectedTasks.length === 0 ? (
              <p className="empty-state">Nothing scheduled for this date yet.</p>
            ) : (
              selectedTasks.map((task) => (
                <div key={task._id} className="calendar-task-row">
                  <strong>{task.description}</strong>
                  <span>{task.time || "Any time"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
