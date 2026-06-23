import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const ChecklistContext = createContext();

export const ChecklistProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLists = useCallback(async () => {
    if (!user) {
      setLists([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/api/checklists");
      setLists(res.data.lists || []);
    } catch (err) {
      console.error("FETCH LISTS ERROR:", err.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchLists();
    }
  }, [authLoading, fetchLists]);

  const createList = async (title) => {
    try {
      const res = await api.post("/api/checklists", { title });
      setLists((prev) => [res.data.list, ...prev]);
      return { success: true, data: res.data.list };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Unable to create checklist",
      };
    }
  };

  const updateList = async (id, data) => {
    try {
      const res = await api.put(`/api/checklists/${id}`, data);
      setLists((prev) => prev.map((list) => (list._id === id ? res.data.list : list)));
      return { success: true, data: res.data.list };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Unable to update checklist",
      };
    }
  };

  const deleteList = async (id) => {
    try {
      await api.delete(`/api/checklists/${id}`);
      setLists((prev) => prev.filter((list) => list._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Unable to delete checklist",
      };
    }
  };

  const value = useMemo(
    () => ({
      lists,
      loading,
      createList,
      updateList,
      deleteList,
      refreshLists: fetchLists,
    }),
    [lists, loading, fetchLists]
  );

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>;
};
