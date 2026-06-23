import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { AuthContext } from "./AuthContext";

export const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/api/notes");
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error("FETCH NOTES ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotes();
    }
  }, [authLoading, fetchNotes]);

  const addNote = async ({ title, content }) => {
    try {
      const res = await api.post("/api/notes", { title, content });
      setNotes((prev) => [res.data.note, ...prev]);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to add note",
      };
    }
  };

  const updateNote = async (id, title, content) => {
    try {
      const res = await api.put(`/api/notes/${id}`, { title, content });
      setNotes((prev) => prev.map((note) => (note._id === id ? res.data.note : note)));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to update note",
      };
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Unable to delete note",
      };
    }
  };

  const value = useMemo(
    () => ({
      notes,
      loading,
      fetchNotes,
      addNote,
      updateNote,
      deleteNote,
    }),
    [notes, loading, fetchNotes]
  );

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};
