import { createContext, useState, useEffect, useContext } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!loading && user) fetchNotes();
    else setNotes([]);
  }, [user, loading]);

  const fetchNotes = async () => {
    const res = await api.get("/api/notes");
    setNotes(res.data);
  };

  const addNote = async ({ title, content }) => {
    const res = await api.post("/api/notes", { title, content });
    setNotes(prev => [res.data, ...prev]);
  };

  const updateNote = async (id, title, content) => {
    const res = await api.put(`/api/notes/${id}`, { title, content });
    setNotes(prev => prev.map(n => n._id === id ? res.data : n));
  };

  const deleteNote = async (id) => {
    await api.delete(`/api/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  );
};
