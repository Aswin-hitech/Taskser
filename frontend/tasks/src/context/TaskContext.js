import { createContext, useState, useEffect, useContext } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!loading && user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, loading]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/tasks");
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err.message);
    }
  };

  const addTask = async (taskData) => {
    try {
      const res = await api.post("/api/tasks", taskData);
      if (res.data.success) {
        setTasks((prev) => [res.data.task, ...prev]);
      }
    } catch (err) {
      console.error("ADD TASK ERROR:", err.message);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await api.put(`/api/tasks/${id}`);
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? res.data.task : t))
        );
      }
    } catch (err) {
      console.error("TOGGLE ERROR:", err.message);
    }
  };

  const updateBulkPriority = async (priorities) => {
    try {
      await api.put("/api/tasks/bulk/priority", { priorities });
    } catch (err) {
      console.error("BULK UPDATE ERROR:", err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await api.delete(`/api/tasks/${id}`);
      if (res.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error("DELETE ERROR:", err.message);
    }
  };

  const checkInHabit = async (id) => {
    try {
      const res = await api.post(`/api/tasks/${id}/checkin`);
      if (res.data.success) {
        setTasks(prev =>
          prev.map(t => (t._id === id ? res.data.task : t))
        );
      }
    } catch (err) {
      console.error("CHECK-IN ERROR:", err.message);
    }
  };

  const resetHabitStreak = async (id) => {
    try {
      const res = await api.post(`/api/tasks/${id}/reset-streak`);
      if (res.data.success) {
        setTasks(prev =>
          prev.map(t => (t._id === id ? res.data.task : t))
        );
      }
    } catch (err) {
      console.error("RESET STREAK ERROR:", err.message);
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      toggleComplete,
      deleteTask,
      checkInHabit,
      resetHabitStreak,
      updateBulkPriority
    }}>
      {children}
    </TaskContext.Provider>
  );
};
