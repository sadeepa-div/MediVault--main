import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaHospital,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

import { clearAuthSession, readAuthToken } from "../session";

import "./PharmacyManagement.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const emptyForm = {
  name: "",
  address: "",
  city: "",
  phone: "",
  email: "",
};

function PharmacyManagement() {
  const navigate = useNavigate();

  const token = readAuthToken();

  const [pharmacies, setPharmacies] = useState([]);

  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  // ==========================
  // LOAD PHARMACIES
  // ==========================

  const loadPharmacies = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/pharmacies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthSession();

          navigate("/");

          return;
        }

        showMessage(data.message || "Could not load pharmacies.", "error");

        return;
      }

      setPharmacies(data);
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  // ==========================
  // FORM CHANGE
  // ==========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);

    setEditingId(null);
  };

  // ==========================
  // ADD / UPDATE
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      showMessage("Pharmacy name and address are required.", "error");

      return;
    }

    try {
      setSaving(true);

      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `${API_URL}/pharmacies/${editingId}`
        : `${API_URL}/pharmacies`;

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthSession();

          navigate("/");

          return;
        }

        if (response.status === 403) {
          showMessage("Admin access required.", "error");

          return;
        }

        showMessage(data.message || "Could not save pharmacy.", "error");

        return;
      }

      showMessage(
        editingId
          ? "Pharmacy updated successfully."
          : "Pharmacy added successfully.",

        "success",
      );

      resetForm();

      await loadPharmacies();
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // EDIT
  // ==========================

  const handleEdit = (pharmacy) => {
    setEditingId(pharmacy.id);

    setFormData({
      name: pharmacy.name || "",

      address: pharmacy.address || "",

      city: pharmacy.city || "",

      phone: pharmacy.phone || "",

      email: pharmacy.email || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================
  // DELETE
  // ==========================

  const handleDelete = async (pharmacy) => {
    const confirmed = window.confirm(`Delete "${pharmacy.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/pharmacies/${pharmacy.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Could not delete pharmacy.", "error");

        return;
      }

      showMessage("Pharmacy deleted successfully.", "success");

      if (editingId === pharmacy.id) {
        resetForm();
      }

      await loadPharmacies();
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    }
  };

  return (
    <div className="pharmacy-management-page">
      {/* HEADER */}

      <header className="pharmacy-management-header">
        <button
          className="pharmacy-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Dashboard
        </button>

        <div className="pharmacy-page-title">
          <div className="pharmacy-title-icon">
            <FaHospital />
          </div>

          <div>
            <h1>Pharmacy Management</h1>

            <p>Add and manage pharmacies connected to MediVault.</p>
          </div>
        </div>
      </header>

      <main className="pharmacy-management-container">
        {/* FORM */}

        <section className="pharmacy-form-card">
          <div className="pharmacy-form-heading">
            <div>
              <h2>{editingId ? "Edit Pharmacy" : "Add New Pharmacy"}</h2>

              <p>Enter pharmacy information.</p>
            </div>

            {editingId && (
              <button
                type="button"
                className="pharmacy-cancel-button"
                onClick={resetForm}
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>

          {message && (
            <div className={`pharmacy-message ${messageType}`}>{message}</div>
          )}

          <form onSubmit={handleSubmit} className="pharmacy-form">
            <div className="pharmacy-form-grid">
              <div className="pharmacy-field">
                <label>Pharmacy Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: City Pharmacy"
                />
              </div>

              <div className="pharmacy-field">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Example: Colombo"
                />
              </div>

              <div className="pharmacy-field pharmacy-address-field">
                <label>Address *</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full pharmacy address"
                />
              </div>

              <div className="pharmacy-field">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0112345678"
                />
              </div>

              <div className="pharmacy-field">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="pharmacy@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="pharmacy-save-button"
              disabled={saving}
            >
              {editingId ? <FaSave /> : <FaPlus />}

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Pharmacy"
                  : "Add Pharmacy"}
            </button>
          </form>
        </section>

        {/* PHARMACY LIST */}

        <section className="pharmacy-list-card">
          <div className="pharmacy-list-heading">
            <div>
              <h2>Registered Pharmacies</h2>

              <p>
                {pharmacies.length} pharmacy
                {pharmacies.length !== 1 ? "ies" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="pharmacy-loading">Loading pharmacies...</div>
          ) : pharmacies.length === 0 ? (
            <div className="pharmacy-empty">No pharmacies found.</div>
          ) : (
            <div className="pharmacy-card-grid">
              {pharmacies.map((pharmacy) => (
                <div className="pharmacy-card" key={pharmacy.id}>
                  <div className="pharmacy-card-top">
                    <div className="pharmacy-card-icon">
                      <FaHospital />
                    </div>

                    <div>
                      <h3>{pharmacy.name}</h3>

                      <span>{pharmacy.city || "City not specified"}</span>
                    </div>
                  </div>

                  <div className="pharmacy-details">
                    <div>
                      <FaMapMarkerAlt />

                      <span>{pharmacy.address}</span>
                    </div>

                    <div>
                      <FaPhone />

                      <span>{pharmacy.phone || "No phone number"}</span>
                    </div>

                    <div>
                      <FaEnvelope />

                      <span>{pharmacy.email || "No email"}</span>
                    </div>
                  </div>

                  <div className="pharmacy-card-actions">
                    <button
                      className="pharmacy-edit-button"
                      onClick={() => handleEdit(pharmacy)}
                    >
                      <FaEdit />
                      Edit
                    </button>

                    <button
                      className="pharmacy-delete-button"
                      onClick={() => handleDelete(pharmacy)}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PharmacyManagement;
