import { useContext, useEffect, useState } from "react";
import { TaskContext } from "../context/TaskContext";
import { NoteContext } from "../context/NoteContext";
import AddTaskForm from "../components/AddTaskForm";
import TaskCard from "../components/TaskCard";
import ProgressMeter from "../components/ProgressMeter";
import { processNotifications, requestNotificationPermission } from "../utils/notificationEngine";

export default function Dashboard() {
  const {
    tasks,
    toggleComplete,
    deleteTask,
    checkInHabit,
    resetHabitStreak,
  } = useContext(TaskContext);

  const { notes } = useContext(NoteContext);
  const [localTasks, setLocalTasks] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(enabled => {
      setNotificationEnabled(enabled);
      if (enabled) {
        console.log("Notifications enabled");
      }
    });
  }, []);

  // Process notifications every minute
  useEffect(() => {
    if (!notificationEnabled) return;

    const interval = setInterval(() => {
      console.log("Checking for notifications...");
      processNotifications(tasks);
    }, 60 * 1000); // Every minute

    // Also run immediately
    processNotifications(tasks);

    return () => clearInterval(interval);
  }, [tasks, notificationEnabled]);

  const total = localTasks.length;
  const completed = localTasks.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleDragStart = (index) => {
    setDragIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...localTasks];
    const draggedItem = updated[dragIndex];
    updated.splice(dragIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDragIndex(index);
    setLocalTasks(updated);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setIsDragging(false);
  };

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>Your Dashboard</h1>
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
            <span className="stat-value">{total - completed}</span>
          </div>
        </div>
      </div>
     {/* Notification Status */}
      {!notificationEnabled && (
        <div className="notification-warning">
          <p>
            🔔 Notifications are disabled. Enable them in your browser settings 
            to receive task reminders.
          </p>
        </div>
      )}

      {/* Progress Meter + Add Task Form Row */}
      <ProgressMeter percentage={percentage} />
      <AddTaskForm />

      {/* Tasks Section */}
      <div className={`section tasks ${isDragging ? 'dragging-active' : ''}`}>
        <h2>
          <span className="icon">📋</span>
          Your Tasks   
          <span className="task-count"> :  {localTasks.length}</span>
        </h2>
        
        {localTasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✨</span>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started!</p>
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
      </div>

      {/* Notes Section */}
      <div className="section notes">
        <h2>
          <span className="icon">📝</span>
          Recent Notes
        </h2>
        
        {notes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📄</span>
            <h3>No notes yet</h3>
          </div>
        ) : (
          <div className="notes-list">
            {notes.slice(0, 4).map(note => (
              <div key={note._id} className="note-card">
                <div className="note-header">
                  <strong className="note-title">{note.title}</strong>
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="note-preview">
                  {note.content.substring(0, 120)}
                  {note.content.length > 120 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}