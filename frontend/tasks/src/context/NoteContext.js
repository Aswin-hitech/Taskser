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
    try {
      const res = await api.get("/api/notes");
      if (res.data.success) {
        setNotes(res.data.notes);
      }
    } catch (err) {
      console.error("FETCH NOTES ERROR:", err.message);
    }
  };

  const addNote = async ({ title, content }) => {
    try {
      const res = await api.post("/api/notes", { title, content });
      if (res.data.success) {
        setNotes(prev => [res.data.note, ...prev]);
      }
    } catch (err) {
      console.error("ADD NOTE ERROR:", err.message);
    }
  };

  const updateNote = async (id, title, content) => {
    try {
      const res = await api.put(`/api/notes/${id}`, { title, content });
      if (res.data.success) {
        setNotes(prev => prev.map(n => n._id === id ? res.data.note : n));
      }
    } catch (err) {
      console.error("UPDATE NOTE ERROR:", err.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await api.delete(`/api/notes/${id}`);
      if (res.data.success) {
        setNotes(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error("DELETE NOTE ERROR:", err.message);
    }
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  );
};
