import { useContext, useState } from "react";
import { ChecklistContext } from "../context/ChecklistContext";
import ChecklistCard from "../components/ChecklistCard";

export default function Checklists() {
  const { lists, createList, updateList, deleteList } =
    useContext(ChecklistContext);

  const [title, setTitle] = useState("");

  return (
    <div className="page-container">
      <h1>Checklists</h1>

      {/* CREATE LIST */}
      <div className="soft-card wide-section">
        <input
          placeholder="New checklist title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={() => {
            createList(title);
            setTitle("");
          }}
        >
          Create List
        </button>
      </div>

      {/* LISTS */}
      {lists.length === 0 ? (
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
