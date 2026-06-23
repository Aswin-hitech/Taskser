import { useContext, useState } from "react";
import { NoteContext } from "../context/NoteContext";

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, loading } = useContext(NoteContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleAdd = async (event) => {
    event.preventDefault();
    setFeedback("");
    const result = await addNote({ title, content });

    if (!result.success) {
      setFeedback(result.message);
      return;
    }

    setTitle("");
    setContent("");
  };

  const handleSaveEdit = async (id) => {
    const result = await updateNote(id, editTitle, editContent);
    if (!result.success) {
      setFeedback(result.message);
      return;
    }

    setEditingId(null);
  };

  return (
    <div className="page-container">
      <h1>Notes</h1>

      <div className="soft-card wide-section">
        <form onSubmit={handleAdd}>
          <label className="field-group">
            <span>Title</span>
            <input
              type="text"
              placeholder="Optional title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="field-group">
            <span>Content</span>
            <textarea
              placeholder="Write your note..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          {feedback ? <p className="form-error">{feedback}</p> : null}
          <button type="submit">Add Note</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <p className="empty-state">No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div key={note._id} className="soft-card wide-section note-card">
            {editingId === note._id ? (
              <>
                <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                />

                <div className="task-actions">
                  <button onClick={() => handleSaveEdit(note._id)} type="button">
                    Save
                  </button>
                  <button className="secondary" onClick={() => setEditingId(null)} type="button">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="note-header">
                  <h3>{note.title || "Untitled"}</h3>
                  <small className="note-date">
                    {new Date(note.createdAt).toLocaleString()}
                  </small>
                </div>
                <p className="note-preview">{note.content}</p>

                <div className="task-actions">
                  <button
                    onClick={() => {
                      setEditingId(note._id);
                      setEditTitle(note.title);
                      setEditContent(note.content);
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button className="danger" onClick={() => deleteNote(note._id)} type="button">
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
