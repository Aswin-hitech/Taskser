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
      setLists(res.data);
    } catch {
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
    const res = await api.post("/api/checklists", { title });
    setLists(prev => [...prev, res.data]);
  };

  const updateList = async (id, data) => {
    const res = await api.put(`/api/checklists/${id}`, data);
    setLists(prev => prev.map(l => l._id === id ? res.data : l));
  };

  const deleteList = async (id) => {
    await api.delete(`/api/checklists/${id}`);
    setLists(prev => prev.filter(l => l._id !== id));
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
