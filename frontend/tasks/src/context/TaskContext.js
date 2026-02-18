import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();


// Use global axios from AuthContext configuration

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
      const res = await axios.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err.response?.data || err.message);
    }
  };

  const addTask = async (taskData) => {
    try {
      console.log("🔥 ADD TASK CALLED:", taskData);
      const res = await axios.post("/api/tasks", taskData);
      setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("ADD TASK ERROR:", err.response?.data || err.message);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await axios.put(`/api/tasks/${id}`);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? res.data : t))
      );
    } catch (err) {
      console.error("TOGGLE ERROR:", err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err.message);
    }
  };
  const checkInHabit = async (id) => {
    try {
      const res = await axios.post(`/api/tasks/${id}/checkin`);
      setTasks(prev =>
        prev.map(t => (t._id === id ? res.data : t))
      );
    } catch (err) {
      console.error("CHECK-IN ERROR:", err.message);
    }
  };
  const resetHabitStreak = async (id) => {
    try {
      const res = await axios.post(`/api/tasks/${id}/reset-streak`);
      setTasks(prev =>
        prev.map(t => (t._id === id ? res.data : t))
      );
    } catch (err) {
      console.error("RESET STREAK ERROR:", err.message);
    }
  };
  const moveTask = async (id, direction) => {
    await axios.put(`/api/tasks/${id}/move`, { direction });
    fetchTasks();
  };


  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      toggleComplete,
      deleteTask,
      checkInHabit,
      resetHabitStreak,
      moveTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};
