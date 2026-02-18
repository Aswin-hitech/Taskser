import { createContext, useState, useEffect, useContext } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const ChecklistContext = createContext();

export const ChecklistProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [lists, setLists] = useState([]);

  const fetchLists = async () => {
    try {
      const res = await api.get("/api/checklists");
      if (res.data.success) {
        setLists(res.data.lists);
      }
    } catch (err) {
      console.error("FETCH LISTS ERROR:", err.message);
      setLists([]);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchLists();
    } else {
      setLists([]);
    }
  }, [loading, user]);

  const createList = async (title) => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/api/checklists", { title });
      if (res.data.success) {
        setLists(prev => [...prev, res.data.list]);
      }
    } catch (err) {
      console.error("CREATE LIST ERROR:", err.message);
    }
  };

  const updateList = async (id, data) => {
    try {
      const res = await api.put(`/api/checklists/${id}`, data);
      if (res.data.success) {
        setLists(prev => prev.map(l => l._id === id ? res.data.list : l));
      }
    } catch (err) {
      console.error("UPDATE LIST ERROR:", err.message);
    }
  };

  const deleteList = async (id) => {
    try {
      const res = await api.delete(`/api/checklists/${id}`);
      if (res.data.success) {
        setLists(prev => prev.filter(l => l._id !== id));
      }
    } catch (err) {
      console.error("DELETE LIST ERROR:", err.message);
    }
  };

  return (
    <ChecklistContext.Provider value={{
      lists,
      createList,
      updateList,
      deleteList
    }}>
      {children}
    </ChecklistContext.Provider>
  );
};
