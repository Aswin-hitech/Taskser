import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMePreference") !== "false"
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await register(username, password, rememberMe);

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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Set up a secure Taskser workspace in a minute.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="Choose a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Use at least 8 characters"
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
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link id="reg" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
