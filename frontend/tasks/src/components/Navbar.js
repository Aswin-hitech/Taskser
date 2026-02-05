import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import hamburger from "../assets/hamburger.jpg";
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
      <div className="navbar-brand">TASKSER</div>

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

      {/* Hamburger Icon (Mobile) */}
      <img
        src={hamburger}
        alt="Menu"
        className="hamburger-icon mobile-only"
        onClick={() => setMenuOpen(!menuOpen)}
      />

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>Tasks</NavLink>
          <NavLink to="/calendar" className={linkClass} onClick={() => setMenuOpen(false)}>Calendar</NavLink>
          <NavLink to="/notes" className={linkClass} onClick={() => setMenuOpen(false)}>Notes</NavLink>
          <NavLink to="/notifications" className={linkClass} onClick={() => setMenuOpen(false)}>Notifications</NavLink>
          <NavLink to="/settings" className={linkClass} onClick={() => setMenuOpen(false)}>Settings</NavLink>
          <NavLink to="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>

          <button className="logout-btn mobile-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
