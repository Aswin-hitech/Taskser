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

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      const result = await login(username, password, rememberMe);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2 className="auth-title">TASKSER</h2>
          <h4 className="auth-subtitle">Your Personal Task Scheduler</h4>
          {error && <div className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={isLoggingIn}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoggingIn}
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
              disabled={isLoggingIn}
            />
            <span>Save login info</span>
          </label>

          <button type="submit" className="auth-button" disabled={isLoggingIn}>
            {isLoggingIn ? "Waiting to let you log in..." : "Login"}
          </button>
        </form>
        <br></br>
        <p className="auth-footer">
          No account? <Link id="reg" to="/register">Register</Link>
        </p>
      </div>

    </div>
  );
}