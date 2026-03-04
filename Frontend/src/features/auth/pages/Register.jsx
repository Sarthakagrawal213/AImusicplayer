import React, { useState } from "react";
import "../styles/login.scss";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { loading, handleRegister } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await handleRegister({ username, email, password });
    navigate("/home");
  }

  return (
    <div className="login-container">
      <div className="overlay"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Register</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="input-group">
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <span className="icon">👤</span>
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="icon">👤</span>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="icon">🔒</span>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="register-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Register;