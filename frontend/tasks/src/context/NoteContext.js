import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get("/api/notes");
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error("FETCH NOTES ERROR:", err.message);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [user, loading, fetchNotes]);

  const addNote = async ({ title, content }) => {
    try {
      const res = await api.post("/api/notes", { title, content });
      setNotes((prev) => [res.data.note, ...prev]);
    } catch (err) {
      console.error("ADD NOTE ERROR:", err.message);
    }
  };

  const updateNote = async (id, title, content) => {
    try {
      const res = await api.put(`/api/notes/${id}`, { title, content });
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data.note : n)));
    } catch (err) {
      console.error("UPDATE NOTE ERROR:", err.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
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
