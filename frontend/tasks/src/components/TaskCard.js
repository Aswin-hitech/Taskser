import HabitGrid from "./HabitGrid";
import { calculateStreak } from "../utils/streak";
import { useSwipeable } from "react-swipeable";

export default function TaskCard({
  task,
  index,
  onToggleComplete,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd, // Changed from onDrop to onDragEnd
  onCheckIn,
  onResetStreak,
}) {
  const isDaily = task.type === "daily";
  const logs = Array.isArray(task.habitLogs) ? task.habitLogs : [];
  const streak = isDaily ? calculateStreak(logs) : 0;

  const today = new Date().toISOString().split("T")[0];
  const checkedToday = isDaily && logs.includes(today);

  // ✅ Swipe RIGHT only = delete
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => onDelete(task._id),
    delta: 120,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div
      {...swipeHandlers}
      className="card swipe-card"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => {
        e.preventDefault();
        onDragOver(e, index);
      }}
      onDrop={() => onDragEnd()} // Changed to onDragEnd
    >
      <p className="task-desc">{task.description}</p>

      {isDaily ? (
        <>
          <HabitGrid logs={logs} />

          <small className="streak-text">
            🔥 {streak} day streak
          </small>

          <div className="task-actions">
            <button
              onClick={() => onCheckIn(task._id)}
              disabled={checkedToday}
            >
              {checkedToday ? "Checked today" : "Check-in"}
            </button>

            <button
              className="secondary"
              onClick={() => onResetStreak(task._id)}
            >
              Reset
            </button>

            <button
              className="danger"
              onClick={() => onDelete(task._id)}
            >
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
            Completed
          </label>

          <button
            className="danger"
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}
