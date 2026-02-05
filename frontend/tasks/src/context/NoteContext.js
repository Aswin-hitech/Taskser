import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const NoteContext = createContext();

// Use global axios from AuthContext configuration

export const NoteProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);



  useEffect(() => {
    if (!loading && user) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [user, loading]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("FETCH NOTES ERROR:", err.message);
    }
  };

  const addNote = async ({ title, content }) => {
    try {
      const res = await axios.post("/api/notes", { title, content });
      setNotes(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("ADD NOTE ERROR:", err.message);
    }
  };


  const updateNote = async (id, title, content) => {
    try {
      const res = await axios.put(`/api/notes/${id}`, { title, content });
      setNotes(prev =>
        prev.map(n => (n._id === id ? res.data : n))
      );
    } catch (err) {
      console.error("UPDATE NOTE ERROR:", err.message);
    }
  };


  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
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
