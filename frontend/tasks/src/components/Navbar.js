import { useContext, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles.css";

const navItems = [
  { to: "/dashboard", label: "Tasks" },
  { to: "/contests", label: "Contests" },
  { to: "/career-roadmap", label: "Roadmap" },
  { to: "/calendar", label: "Calendar" },
  { to: "/checklists", label: "Checklists" },
  { to: "/notes", label: "Notes" },
  { to: "/notifications", label: "Notifications" },
  { to: "/settings", label: "Settings" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = useMemo(
    () => ({ isActive }) => (isActive ? "nav-item active" : "nav-item"),
    []
  );

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const renderLinks = (className = "") =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={linkClass}
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </NavLink>
    ));

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">T</span>
        <div>
          <div>Taskser</div>
          <small>{user.username}</small>
        </div>
      </div>

      <div className="navbar-links desktop-only">{renderLinks()}</div>

      <button onClick={handleLogout} className="logout-btn desktop-only" type="button">
        Logout
      </button>

      <button
        type="button"
        className="menu-toggle mobile-only"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          {renderLinks("mobile-menu-link")}
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
