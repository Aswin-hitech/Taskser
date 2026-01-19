import { useState } from "react";

export default function ChecklistCard({ list, onUpdate, onDelete }) {
  const [items, setItems] = useState(list.items || []);
  const [text, setText] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const save = (updatedItems) => {
    setItems(updatedItems);
    onUpdate(list._id, { items: updatedItems });
  };

  const addItem = () => {
    if (!text.trim()) return;
    save([...items, { text, completed: false, priority: items.length }]);
    setText("");
  };

  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    save(updated);
  };

  return (
    <div className="soft-card wide-section checklist-card">
      {/* HEADER */}
      <div className="checklist-header">
        <h3 className="checklist-title">{list.title}</h3>

        <button
          className="checklist-delete-list"
          onClick={() => {
            if (window.confirm("Delete this checklist?")) {
              onDelete(list._id);
            }
          }}
        >
          🗑
        </button>
      </div>

      {/* ITEMS GRID */}
      <div className="checklist-items">
        {items.map((item, i) => (
          <div
            key={i}
            className="checklist-item"
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const updated = [...items];
              const dragged = updated[dragIndex];
              updated.splice(dragIndex, 1);
              updated.splice(i, 0, dragged);
              save(updated);
            }}
          >
            {/* CHECKBOX + TEXT */}
            <label className="checklist-item-row">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {
                  const updated = [...items];
                  updated[i].completed = !updated[i].completed;
                  save(updated);
                }}
              />

              <span
                className={`checklist-text ${
                  item.completed ? "completed" : ""
                }`}
              >
                {item.text}
              </span>
            </label>

            {/* DELETE ITEM */}
            <button
              className="checklist-delete-item"
              onClick={() => deleteItem(i)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ADD ITEM */}
      <div className="checklist-add">
        <input
          placeholder="Add item..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
    </div>
  );
}
