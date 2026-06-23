import HabitGrid from "./HabitGrid";
import { calculateStreak } from "../utils/streak";
import { useSwipeable } from "react-swipeable";

const formatTaskDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

export default function TaskCard({
  task,
  index,
  isDragging,
  onToggleComplete,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onCheckIn,
  onResetStreak,
}) {
  const isDaily = task.type === "daily";
  const logs = Array.isArray(task.habitLogs) ? task.habitLogs : [];
  const streak = isDaily ? calculateStreak(logs) : 0;
  const today = new Date().toISOString().split("T")[0];
  const checkedToday = isDaily && logs.includes(today);

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => onDelete(task._id),
    delta: 120,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <article
      {...swipeHandlers}
      className={`card swipe-card ${isDragging ? "is-dragging" : ""}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(event) => onDragOver(event, index)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-top">
        <p className="task-desc">{task.description}</p>
        <span className={`task-type-badge ${isDaily ? "habit" : "scheduled"}`}>
          {isDaily ? "Habit" : "Scheduled"}
        </span>
      </div>

      {!isDaily && (task.date || task.time) ? (
        <p className="task-meta">
          {task.date ? formatTaskDate(task.date) : "No date"}
          {task.time ? ` at ${task.time}` : ""}
        </p>
      ) : null}

      {isDaily ? (
        <>
          <HabitGrid logs={logs} />

          <small className="streak-text">{streak} day streak</small>

          <div className="task-actions">
            <button onClick={() => onCheckIn(task._id)} disabled={checkedToday}>
              {checkedToday ? "Checked today" : "Check in"}
            </button>

            <button className="secondary" onClick={() => onResetStreak(task._id)}>
              Reset
            </button>

            <button className="danger" onClick={() => onDelete(task._id)}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <label className="task-checkbox">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task._id)}
            />
            <span>Completed</span>
          </label>

          <div className="task-actions">
            <button className="danger" onClick={() => onDelete(task._id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}
