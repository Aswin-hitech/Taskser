import { useContext, useEffect, useMemo, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import { NoteContext } from "../context/NoteContext";
import AddTaskForm from "../components/AddTaskForm";
import TaskCard from "../components/TaskCard";
import ProgressMeter from "../components/ProgressMeter";
import {
  processNotifications,
  requestNotificationPermission,
} from "../utils/notificationEngine";

export default function Dashboard() {
  const {
    tasks,
    loading,
    toggleComplete,
    deleteTask,
    checkInHabit,
    resetHabitStreak,
    reorderTasks,
  } = useContext(TaskContext);
  const { notes } = useContext(NoteContext);
  const [localTasks, setLocalTasks] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    requestNotificationPermission().then(setNotificationEnabled);
  }, []);

  useEffect(() => {
    if (!notificationEnabled || tasks.length === 0) return undefined;

    processNotifications(tasks);
    const interval = setInterval(() => {
      processNotifications(tasks);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, notificationEnabled]);

  const total = localTasks.length;
  const completed = localTasks.filter((task) => task.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const recentNotes = useMemo(() => notes.slice(0, 4), [notes]);

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const reordered = [...localTasks];
    const [draggedTask] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, draggedTask);
    setDragIndex(index);
    setLocalTasks(reordered);
  };

  const handleDragEnd = async () => {
    if (dragIndex !== null) {
      await reorderTasks(localTasks);
    }
    setDragIndex(null);
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Your Dashboard</h1>
          <p className="page-subtitle">See what is due, what is moving, and what still needs attention.</p>
        </div>

        <div className="stats-overview">
          <div className="stat-card total">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completed}</span>
          </div>
          <div className="stat-card progress">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{Math.max(total - completed, 0)}</span>
          </div>
        </div>
      </div>

      {!notificationEnabled && (
        <div className="notification-warning">
          <p>Browser reminders are off right now. You can still manage tasks here, but reminders will stay quiet until permission is enabled.</p>
        </div>
      )}

      <ProgressMeter percentage={percentage} />
      <AddTaskForm />

      <section className="section tasks">
        <div className="section-header">
          <h2>Your Tasks</h2>
          <span className="task-count">{localTasks.length}</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading tasks...</p>
          </div>
        ) : localTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">+</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {localTasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                isDragging={index === dragIndex}
                onToggleComplete={toggleComplete}
                onDelete={deleteTask}
                onCheckIn={checkInHabit}
                onResetStreak={resetHabitStreak}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section notes">
        <div className="section-header">
          <h2>Recent Notes</h2>
          <span className="task-count">{recentNotes.length}</span>
        </div>

        {recentNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">N</div>
            <h3>No notes yet</h3>
            <p>Capture quick ideas or reference details here.</p>
          </div>
        ) : (
          <div className="notes-list">
            {recentNotes.map((note) => (
              <article key={note._id} className="note-card">
                <div className="note-header">
                  <strong className="note-title">{note.title}</strong>
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="note-preview">
                  {note.content.substring(0, 140)}
                  {note.content.length > 140 ? "..." : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
