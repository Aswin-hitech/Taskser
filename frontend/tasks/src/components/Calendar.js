import { useState, useContext } from "react";
import { TaskContext } from "../context/TaskContext";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Calendar() {
  const { tasks, addTask } = useContext(TaskContext);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState(null);
  const [taskText, setTaskText] = useState("");

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const scheduledTasks = tasks.filter(
    t => t.type === "scheduled" && t.date
  );

  const changeMonth = (dir) => {
    if (dir === "prev") {
      if (month === 0) {
        setMonth(11);
        setYear(y => y - 1);
      } else setMonth(m => m - 1);
    } else {
      if (month === 11) {
        setMonth(0);
        setYear(y => y + 1);
      } else setMonth(m => m + 1);
    }
  };

  const hasTaskOnDate = (dateStr) =>
    scheduledTasks.some(t =>
      new Date(t.date).toISOString().split("T")[0] === dateStr
    );

  const handleAddTask = async () => {
    if (!taskText.trim()) return;

    await addTask({
      description: taskText,
      type: "scheduled",
      date: selectedDate,
    });

    setTaskText("");
    setSelectedDate(null);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="page-container">
      <h1>Calendar</h1>

      <div className="calendar-wrapper">

        {/* HEADER */}
        <div className="calendar-header">
          <button onClick={() => changeMonth("prev")}>◀</button>
          <h2>{months[month]} {year}</h2>
          <button onClick={() => changeMonth("next")}>▶</button>
        </div>

        {/* GRID */}
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="calendar-day-label">{d}</div>
          ))}

          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array(daysInMonth).fill(null).map((_, i) => {
            const dateStr = new Date(year, month, i + 1)
              .toISOString()
              .split("T")[0];

            return (
              <div
                key={i}
                className={`calendar-day
                  ${selectedDate === dateStr ? "selected" : ""}
                  ${dateStr === todayStr ? "today" : ""}
                `}
                onClick={() => setSelectedDate(dateStr)}
              >
                {i + 1}
                {hasTaskOnDate(dateStr) && (
                  <span className="calendar-task-dot" />
                )}
              </div>
            );
          })}
        </div>

        {/* ADD TASK BELOW CALENDAR */}
        {selectedDate && (
          <div className="calendar-add-task soft-card">
            <h3>Schedule task for {selectedDate}</h3>

            <input
              placeholder="Task description"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />

            <div className="task-actions">
              <button onClick={handleAddTask}>Add Task</button>
              <button
                className="secondary"
                onClick={() => setSelectedDate(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
