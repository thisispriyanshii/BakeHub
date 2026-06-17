import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

import {
  FaBirthdayCake,
  FaHeart,
  FaTruck,
  FaAward,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    if (!fullName.trim()) {
      setError("Please enter your full name");
      setSuccess("");
      return;
    }

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
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          phone:""
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        setError(data || "Signup failed");
        return;
      }

      setSuccess(data || "User registered successfully");


      setFullName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
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

          <p className="tagline">Where every bite tells a story ♥</p>
        </div>

        <div className="signup-card">
          <h2>Create Your Account</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

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

          <button type="button" onClick={handleSignup}>
            SIGN UP →
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
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

export default Signup;