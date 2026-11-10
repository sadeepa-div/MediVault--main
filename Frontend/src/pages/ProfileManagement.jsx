import { useEffect, useState } from "react";
import { dashboardRequest } from "../api/dashboardApi";

function dateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function ProfileManagement({ user, onUserUpdated }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    birthday: dateInputValue(user?.birthday),
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      birthday: dateInputValue(user?.birthday),
      phone: user?.phone || "",
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await dashboardRequest("/auth/me", {
        method: "PUT",
        body: form,
      });
      onUserUpdated(data.user);
      localStorage.setItem("medivault_user", JSON.stringify(data.user));
      setMessage(data.message || "Profile updated successfully.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="management-section profile-section">
      <div className="management-heading">
        <div>
          <h2>Your Profile</h2>
          <p>Update your personal details. Your email and account role cannot be changed here.</p>
        </div>
      </div>

      {error && <p className="management-alert management-error" role="alert">{error}</p>}
      {message && <p className="management-alert management-success" role="status">{message}</p>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            required
            maxLength={100}
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          />
        </label>
        <label>
          Email
          <input value={user?.email || ""} readOnly />
        </label>
        <label>
          Birthday
          <input
            type="date"
            value={form.birthday}
            onChange={(event) => setForm({ ...form, birthday: event.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            maxLength={20}
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </label>
        <label>
          Account role
          <input value={user?.role || ""} readOnly />
        </label>
        <button className="primary-action" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}

export default ProfileManagement;
