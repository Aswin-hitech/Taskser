import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">TaskFlow</div>

      {/* Desktop Links */}
      <div className="navbar-links desktop-only">
        <NavLink to="/dashboard" className={linkClass}>Tasks</NavLink>
        <NavLink to="/calendar" className={linkClass}>Calendar</NavLink>
        <NavLink to="/checklists" className={linkClass}>Checklists</NavLink>
        <NavLink to="/notes" className={linkClass}>Notes</NavLink>
        <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
        <NavLink to="/settings" className={linkClass}>Settings</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
      </div>

      {/* Desktop Logout */}
      <button onClick={handleLogout} className="logout-btn desktop-only">
        Logout
      </button>

      <button
        type="button"
        className="menu-toggle mobile-only"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
