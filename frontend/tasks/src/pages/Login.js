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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
const result = await login(username, password);
      if (result && !result.success) {
        alert(result.message || "Login failed");
        setIsLoggingIn(false);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Login failed");
      setIsLoggingIn(false);
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