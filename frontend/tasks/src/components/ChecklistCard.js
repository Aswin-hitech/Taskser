import { useEffect, useState } from "react";

export default function ChecklistCard({ list, onUpdate, onDelete }) {
  const [items, setItems] = useState(list.items || []);
  const [text, setText] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    setItems(list.items || []);
  }, [list.items]);

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
    save(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="soft-card wide-section checklist-card">
      <div className="checklist-header">
        <h3 className="checklist-title">{list.title}</h3>

        <button
          className="checklist-delete-list"
          onClick={() => {
            if (window.confirm("Delete this checklist?")) {
              onDelete(list._id);
            }
          }}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className="checklist-items">
        {items.map((item, index) => (
          <div
            key={`${list._id}-${index}`}
            className="checklist-item"
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              const updated = [...items];
              const [dragged] = updated.splice(dragIndex, 1);
              updated.splice(index, 0, dragged);
              save(updated.map((entry, entryIndex) => ({ ...entry, priority: entryIndex })));
            }}
          >
            <label className="checklist-item-row">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {
                  const updated = [...items];
                  updated[index].completed = !updated[index].completed;
                  save(updated);
                }}
              />

              <span className={`checklist-text ${item.completed ? "completed" : ""}`}>
                {item.text}
              </span>
            </label>

            <button className="checklist-delete-item" onClick={() => deleteItem(index)} type="button">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="checklist-add">
        <input
          placeholder="Add item..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
        />
        <button onClick={addItem} type="button">
          Add
        </button>
      </div>
    </div>
  );
}
