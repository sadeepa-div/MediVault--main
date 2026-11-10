import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaUserShield,
  FaSave,
} from "react-icons/fa";

import { readAuthToken, clearAuthSession, writeAuthSession } from "../session";

import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function Profile() {
  const navigate = useNavigate();
  const token = readAuthToken();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthday: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          clearAuthSession();
          navigate("/");
          return;
        }

        const user = data.user;

        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",

          birthday: user.birthday ? String(user.birthday).slice(0, 10) : "",

          phone: user.phone || "",
          role: user.role || "",
        });
      } catch (error) {
        console.error(error);

        setMessage("Could not load profile.");

        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setMessage("Full name is required.");

      setMessageType("error");

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          fullName: formData.fullName,

          birthday: formData.birthday,

          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        clearAuthSession();
        navigate("/");
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Could not update profile.");

        setMessageType("error");

        return;
      }

      writeAuthSession(token, data.user);

      setFormData({
        fullName: data.user.fullName || "",

        email: data.user.email || "",

        birthday: data.user.birthday
          ? String(data.user.birthday).slice(0, 10)
          : "",

        phone: data.user.phone || "",

        role: data.user.role || "",
      });

      setMessage("Profile updated successfully.");

      setMessageType("success");
    } catch (error) {
      console.error(error);

      setMessage("Cannot connect to the server.");

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Dashboard
        </button>

        <div className="profile-title">
          <FaUserCircle />

          <div>
            <h1>My Profile</h1>

            <p>View and update your account.</p>
          </div>
        </div>
      </header>

      <main className="profile-container">
        <section className="profile-card">
          <div className="profile-user-info">
            <FaUserCircle />

            <div>
              <h2>{formData.fullName}</h2>

              <p>{formData.email}</p>

              <span>{formData.role}</span>
            </div>
          </div>

          {message && (
            <div className={`profile-message ${messageType}`}>{message}</div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>

                <div className="profile-input">
                  <FaUserCircle />

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Email</label>

                <div className="profile-input readonly">
                  <FaEnvelope />

                  <input type="email" value={formData.email} disabled />
                </div>
              </div>

              <div className="profile-field">
                <label>Birthday</label>

                <div className="profile-input">
                  <FaCalendarAlt />

                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Phone</label>

                <div className="profile-input">
                  <FaPhone />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Role</label>

                <div className="profile-input readonly">
                  <FaUserShield />

                  <input type="text" value={formData.role} disabled />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              <FaSave />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Profile;
