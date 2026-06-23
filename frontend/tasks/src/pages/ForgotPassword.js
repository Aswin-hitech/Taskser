import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../context/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setDevResetUrl("");

    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      setSuccess(response.data.message);
      setDevResetUrl(response.data.resetUrl || "");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Enter your email and we will prepare a secure reset link.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          {devResetUrl ? (
            <p className="setting-description">
              Development reset link: <a href={devResetUrl}>{devResetUrl}</a>
            </p>
          ) : null}

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? "Preparing link..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-footer">
          Back to <Link id="reg" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
