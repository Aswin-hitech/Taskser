import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../context/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Choose a new password</h1>
          <p className="auth-subtitle">This reset link works once and expires automatically.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-group">
            <span>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Use at least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="field-group">
            <span>Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? "Updating password..." : "Reset password"}
          </button>
        </form>

        <p className="auth-footer">
          Back to <Link id="reg" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
