import { createContext, useState, useEffect, useContext } from "react";
import api from "./api"; // Use the new api utility
import { AuthContext } from "./AuthContext";

export const ChecklistContext = createContext();

export const ChecklistProvider = ({ children }) => {
  const { authChecked, isAuthenticated } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    if (!isAuthenticated()) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/checklists");
      setLists(res.data);
    } catch (err) {
      console.error("FETCH LISTS ERROR:", err.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchLists();
    }
  }, [authChecked]);

  const createList = async (title) => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/api/checklists", { title });
      setLists((prev) => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      console.error("CREATE LIST ERROR:", err.message);
      return { success: false, error: err.message };
    }
  };

  const updateList = async (id, data) => {
    try {
      const res = await api.put(`/api/checklists/${id}`, data);
      setLists((prev) =>
        prev.map((l) => (l._id === id ? res.data : l))
      );
      return { success: true, data: res.data };
    } catch (err) {
      console.error("UPDATE LIST ERROR:", err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteList = async (id) => {
    try {
      await api.delete(`/api/checklists/${id}`);
      setLists((prev) => prev.filter((l) => l._id !== id));
      return { success: true };
    } catch (err) {
      console.error("DELETE LIST ERROR:", err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <ChecklistContext.Provider
      value={{
        lists,
        loading,
        createList,
        updateList,
        deleteList,
        refreshLists: fetchLists
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};
