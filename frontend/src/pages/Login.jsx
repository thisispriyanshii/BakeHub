import { useState } from "react";
import { Link ,useNavigate} from "react-router-dom";
import "./Signup.css";

import {
  FaBirthdayCake,
  FaHeart,
  FaTruck,
  FaAward,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Login() {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      setSuccess("");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      setSuccess("");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Login failed");
        return;
      }

      if (!data.token) {
        setError("Login succeeded but no token was returned.");
        return;
      }

      localStorage.setItem("bakehub_token", data.token);
      setSuccess("Login successful.");


     setTimeout(() => {
       navigate("/home"); // or "/dashboard"
     }, 1000);

    setEmail("");
          setPassword("");
    } catch (fetchError) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay">
        <div className="hero">
          <h4 className="welcome-text">WELCOME TO</h4>

          <h1 className="logo">BakeHub</h1>

          <p className="tagline">
            Where every bite tells a story ♥
          </p>
        </div>

        <div className="signup-card">
          <h2>Welcome Back!</h2>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {success && (
            <p className="success-message">
              {success}
            </p>
          )}

          <button type="button" onClick={handleLogin}>
            LOGIN →
          </button>

          <p className="login-link">
            Don't have an account? <Link to="/">Sign Up</Link>
          </p>
        </div>

        <div className="bottom-section">
          <h2>
            Freshly baked for <span>every celebration</span>
          </h2>

          <div className="features">
            <div className="feature">
              <FaBirthdayCake />
              <p>Premium Ingredients</p>
            </div>

            <div className="feature">
              <FaHeart />
              <p>Made with Love</p>
            </div>

            <div className="feature">
              <FaTruck />
              <p>On-time Delivery</p>
            </div>

            <div className="feature">
              <FaAward />
              <p>Quality Assured</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;