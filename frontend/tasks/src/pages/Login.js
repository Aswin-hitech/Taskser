import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMePreference") !== "false"
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login(username, password, rememberMe);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Taskser</h1>
          <p className="auth-subtitle">A calmer place to plan tasks, habits, and notes.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Username</span>
            <input
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="settings-option auth-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((value) => !value)}
            />
            <span>Keep me signed in on this device</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          No account yet? <Link id="reg" to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
