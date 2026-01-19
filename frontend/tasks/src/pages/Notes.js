import { useContext, useState } from "react";
import { NoteContext } from "../context/NoteContext";

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useContext(NoteContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addNote({ title, content });
    setTitle("");
    setContent("");
  };

  const handleSaveEdit = async (id) => {
    if (!editContent.trim()) return;
    await updateNote(id, editTitle, editContent);
    setEditingId(null);
  };

  return (
    <div className="page-container">
      <h1>Notes</h1>

      {/* Add note */}
      <div className="soft-card wide-section">
        <form onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit">Add Note</button>
        </form>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="empty-state">No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div key={note._id} className="soft-card wide-section note-card">
            {editingId === note._id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />

                <div className="task-actions">
                  <button onClick={() => handleSaveEdit(note._id)}>Save</button>
                  <button
                    className="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{note.title || "Untitled"}</h3>
                <p className="note-preview">{note.content}</p>
                <small className="note-date">
                  {new Date(note.createdAt).toLocaleString()}
                </small>

                <div className="task-actions">
                  <button
                    onClick={() => {
                      setEditingId(note._id);
                      setEditTitle(note.title);
                      setEditContent(note.content);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="danger"
                    onClick={() => deleteNote(note._id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
