import { useState } from "react";
import {
  FaGoogle,
  FaFacebookF,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

import "./AuthPage.css";

import { GoogleLogin } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  // ----------------------------
  // REGISTER
  // ----------------------------

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      showMessage("Please fill all required fields.", "error");
      return;
    }

    if (formData.password.length < 8) {
      showMessage("Password must contain at least 8 characters.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          birthday: formData.birthday,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Registration failed.", "error");
        return;
      }

      showMessage(
        "Account created successfully. You can now login.",
        "success",
      );

      setFormData({
        fullName: "",
        email: formData.email,
        password: "",
        confirmPassword: "",
        birthday: "",
        phone: "",
      });

      setTimeout(() => {
        setIsLogin(true);
      }, 1200);
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // LOGIN
  // ----------------------------

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showMessage("Please enter your email and password.", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Login failed.", "error");
        return;
      }

      showMessage("Login successful!", "success");

      if (data.token) {
        localStorage.setItem("medivault_token", data.token);
      }

      if (data.user) {
        localStorage.setItem("medivault_user", JSON.stringify(data.user));
      }

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (error) {
      console.error(error);

      showMessage("Login backend is not ready yet.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  // ----------------------------
  // GOOGLE
  // ----------------------------

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Google login failed.", "error");

        return;
      }

      localStorage.setItem("medivault_token", data.token);

      localStorage.setItem("medivault_user", JSON.stringify(data.user));

      showMessage("Google login successful!", "success");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showMessage("Google login was unsuccessful.", "error");
  };

  // ----------------------------
  // FACEBOOK
  // ----------------------------

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/auth/facebook`;
  };

  const changeMode = (loginMode) => {
    setIsLogin(loginMode);
    setMessage("");

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthday: "",
      phone: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>

      <div className="auth-container">
        {/* LEFT SIDE */}

        <div className="auth-left">
          <div className="brand">
            <div className="brand-icon">
              <FaShieldAlt />
            </div>

            <span>MediVault</span>
          </div>

          <div className="welcome-content">
            <p className="small-title">PHARMACY STOCK MANAGEMENT</p>

            <h1>Manage pharmacy information with confidence.</h1>

            <p className="welcome-description">
              Access your MediVault account to search availability, manage
              pharmacy information, monitor stock and keep your data organized
              in one secure system.
            </p>

            <div className="feature-list">
              <div className="feature">
                <span>✓</span>
                Secure account access
              </div>

              <div className="feature">
                <span>✓</span>
                Centralized pharmacy information
              </div>

              <div className="feature">
                <span>✓</span>
                Fast and simple stock management
              </div>
            </div>
          </div>

          <p className="copyright">© 2026 MediVault</p>
        </div>

        {/* RIGHT SIDE */}

        <div className="auth-right">
          <div className="mobile-brand">
            <FaShieldAlt />
            MediVault
          </div>

          <div className="form-header">
            <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>

            <p>
              {isLogin
                ? "Enter your account details to continue."
                : "Enter your information to join MediVault."}
            </p>
          </div>

          {/* LOGIN / SIGN UP TABS */}

          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? "active" : ""}
              onClick={() => changeMode(true)}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => changeMode(false)}
            >
              Sign Up
            </button>
          </div>

          {/* SOCIAL LOGIN */}

          <div className="social-buttons">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                shape="rectangular"
                size="large"
                theme="outline"
              />
            </div>

            <button
              type="button"
              className="social-button facebook-button"
              onClick={handleFacebookLogin}
            >
              <FaFacebookF />
              Continue with Facebook
            </button>
          </div>

          <div className="divider">
            <span></span>
            <p>or continue with email</p>
            <span></span>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label>
                  Full Name
                  <span>*</span>
                </label>

                <div className="input-box">
                  <FaUser />

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>
                Email Address
                <span>*</span>
              </label>

              <div className="input-box">
                <FaEnvelope />

                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                Password
                <span>*</span>
              </label>

              <div className="input-box">
                <FaLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label>
                    Confirm Password
                    <span>*</span>
                  </label>

                  <div className="input-box">
                    <FaLock />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Enter password again"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="two-column">
                  <div className="input-group">
                    <label>Birthday</label>

                    <div className="input-box">
                      <FaCalendarAlt />

                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>

                    <div className="input-box">
                      <FaPhone />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="07XXXXXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className="login-options">
                <label className="remember">
                  <input type="checkbox" />

                  <span>Remember me</span>
                </label>

                <button type="button" className="forgot-password">
                  Forgot password?
                </button>
              </div>
            )}

            {message && (
              <div className={`message ${messageType}`}>{message}</div>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Login"
                  : "Create Account"}
            </button>
          </form>

          <div className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}

            <button type="button" onClick={() => changeMode(!isLogin)}>
              {isLogin ? "Create account" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
