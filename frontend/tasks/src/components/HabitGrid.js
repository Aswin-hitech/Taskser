export default function HabitGrid({ logs = [] }) {
  const today = new Date();
  const days = [];

  // Last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

 return (
    <div className="habit-grid">
      {days.map(date => (
        <div key={date} className={`habit-box ${logs.includes(date) ? "active" : ""}`} />
      ))}
    </div>
  );
}