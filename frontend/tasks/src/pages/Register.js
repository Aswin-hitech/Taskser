import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password);
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <h4 className="auth-subtitle">Start planning with Taskser</h4>
        </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">
          Register
        </button>
      </form>
        <p className="auth-footer">
          Already registered? <Link id="reg" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
