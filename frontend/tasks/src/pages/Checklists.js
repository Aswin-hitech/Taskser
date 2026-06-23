import { useContext, useState } from "react";
import { ChecklistContext } from "../context/ChecklistContext";
import ChecklistCard from "../components/ChecklistCard";

export default function Checklists() {
  const { lists, loading, createList, updateList, deleteList } = useContext(ChecklistContext);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleCreateList = async () => {
    const result = await createList(title);
    if (!result.success) {
      setError(result.error);
      return;
    }

    setError("");
    setTitle("");
  };

  return (
    <div className="page-container">
      <h1>Checklists</h1>

      <div className="soft-card wide-section">
        <div className="checklist-add">
          <input
            placeholder="New checklist title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button onClick={handleCreateList} type="button">
            Create List
          </button>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading checklists...</p>
        </div>
      ) : lists.length === 0 ? (
        <p className="empty-state">No checklists yet.</p>
      ) : (
        lists.map((list) => (
          <ChecklistCard
            key={list._id}
            list={list}
            onUpdate={updateList}
            onDelete={deleteList}
          />
        ))
      )}
    </div>
  );
}
