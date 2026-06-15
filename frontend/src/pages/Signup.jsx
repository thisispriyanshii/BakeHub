import { useState } from "react";
import "./Signup.css";
import { Link } from "react-router-dom";

import {
  FaBirthdayCake,
  FaHeart,
  FaTruck,
  FaAward,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSignup = () => {
    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    console.log({
      fullName,
      email,
      password,
    });
  };

  return (
    <div className="container">
      <div className="overlay">
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