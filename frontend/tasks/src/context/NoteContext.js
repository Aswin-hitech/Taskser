import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const NoteContext = createContext();

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const NoteProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);

  const attachToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  };

  useEffect(() => {
    if (!loading && user) {
      attachToken();
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [user, loading]);

  const fetchNotes = async () => {
    try {
      attachToken();
      const res = await API.get("/api/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("FETCH NOTES ERROR:", err.message);
    }
  };

  const addNote = async ({ title, content }) => {
    try {
      attachToken();
      const res = await API.post("/api/notes", { title, content });
      setNotes(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("ADD NOTE ERROR:", err.message);
    }
  };


  const updateNote = async (id, title, content) => {
    try {
      attachToken();
      const res = await API.put(`/api/notes/${id}`, { title, content });
      setNotes(prev =>
        prev.map(n => (n._id === id ? res.data : n))
      );
    } catch (err) {
      console.error("UPDATE NOTE ERROR:", err.message);
    }
  };


  const deleteNote = async (id) => {
    try {
      attachToken();
      await API.delete(`/api/notes/${id}`);
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
