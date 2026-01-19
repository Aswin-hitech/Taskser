import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "30px", background: "#111", borderRadius: "12px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Create Account</h2>
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
        <button type="submit" style={{ width: "100%", marginTop: 20 }}>
          Register
        </button>
      </form>
    </div>
  );
}
