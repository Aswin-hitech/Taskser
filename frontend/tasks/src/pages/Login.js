import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password, rememberMe);
      navigate("/dashboard");
    } catch {
      alert("Login failed");
    }
  };

 return (
  <div className="auth-page">
    <div className="auth-container">
    <div className="auth-header">
      <h2 className="auth-title">TASKSER</h2>
      <h4 className="auth-subtitle">Your Personal Task Scheduler</h4>
    </div>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <label className="settings-option auth-remember">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => {
              const val = !rememberMe;
              setRememberMe(val);
              localStorage.setItem("rememberMe", val);
            }}
          />
          <span>Save login info</span>
        </label>

        <button type="submit" className="auth-button">
          Login
        </button>
      </form>
      <br></br>
      <p className="auth-footer">
        No account? <Link id = "reg" to="/register">Register</Link>
      </p>
    </div>

  </div>
);
}