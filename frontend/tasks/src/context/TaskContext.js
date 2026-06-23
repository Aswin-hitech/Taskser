import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/api/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("FETCH TASKS ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchTasks();
    }
  }, [authLoading, fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const res = await api.post("/api/tasks", taskData);
      setTasks((prev) => [...prev, res.data.task]);
      return { success: true, task: res.data.task };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to create task",
      };
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await api.put(`/api/tasks/${id}`);
      setTasks((prev) => prev.map((task) => (task._id === id ? res.data.task : task)));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to update task",
      };
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to delete task",
      };
    }
  };

  const checkInHabit = async (id) => {
    try {
      const res = await api.post(`/api/tasks/${id}/checkin`);
      setTasks((prev) => prev.map((task) => (task._id === id ? res.data.task : task)));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to check in",
      };
    }
  };

  const resetHabitStreak = async (id) => {
    try {
      const res = await api.post(`/api/tasks/${id}/reset-streak`);
      setTasks((prev) => prev.map((task) => (task._id === id ? res.data.task : task)));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to reset streak",
      };
    }
  };

  const reorderTasks = useCallback(async (orderedTasks) => {
    const priorities = orderedTasks.map((task, index) => ({
      id: task._id,
      priority: index,
    }));

    setTasks(orderedTasks);

    try {
      await api.put("/api/tasks/bulk/priority", { priorities });
      return { success: true };
    } catch (err) {
      await fetchTasks();
      return {
        success: false,
        message: err.response?.data?.message || "Unable to save task order",
      };
    }
  }, [fetchTasks]);

  const value = useMemo(
    () => ({
      tasks,
      loading,
      fetchTasks,
      addTask,
      toggleComplete,
      deleteTask,
      checkInHabit,
      resetHabitStreak,
      reorderTasks,
    }),
    [tasks, loading, fetchTasks, reorderTasks]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
