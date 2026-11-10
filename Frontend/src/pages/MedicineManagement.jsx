import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCapsules,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import { clearAuthSession, readAuthToken } from "../session";

import "./MedicineManagement.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const emptyForm = {
  name: "",
  genericName: "",
  category: "",
  manufacturer: "",
  description: "",
};

function MedicineManagement() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = readAuthToken();

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/medicines`, {
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

        showMessage(data.message || "Could not load medicines.", "error");

        return;
      }

      setMedicines(data);
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showMessage("Medicine name is required.", "error");

      return;
    }

    try {
      setSaving(true);

      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `${API_URL}/medicines/${editingId}`
        : `${API_URL}/medicines`;

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

        showMessage(data.message || "Could not save medicine.", "error");

        return;
      }

      showMessage(
        editingId
          ? "Medicine updated successfully."
          : "Medicine added successfully.",
        "success",
      );

      resetForm();

      await loadMedicines();
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingId(medicine.id);

    setFormData({
      name: medicine.name || "",
      genericName: medicine.generic_name || "",
      category: medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (medicine) => {
    const confirmed = window.confirm(`Delete "${medicine.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/medicines/${medicine.id}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Could not delete medicine.", "error");

        return;
      }

      showMessage("Medicine deleted successfully.", "success");

      if (editingId === medicine.id) {
        resetForm();
      }

      await loadMedicines();
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to the server.", "error");
    }
  };

  return (
    <div className="medicine-management-page">
      <header className="management-header">
        <button
          className="management-back"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Dashboard
        </button>

        <div className="management-title">
          <div className="management-title-icon">
            <FaCapsules />
          </div>

          <div>
            <h1>Medicine Management</h1>

            <p>Add, update and manage medicines in MediVault.</p>
          </div>
        </div>
      </header>

      <main className="management-container">
        {/* FORM */}

        <section className="medicine-form-card">
          <div className="form-card-heading">
            <div>
              <h2>{editingId ? "Edit Medicine" : "Add New Medicine"}</h2>

              <p>Enter the medicine information below.</p>
            </div>

            {editingId && (
              <button
                className="cancel-edit-button"
                onClick={resetForm}
                type="button"
              >
                <FaTimes />
                Cancel Edit
              </button>
            )}
          </div>

          {message && (
            <div className={`management-message ${messageType}`}>{message}</div>
          )}

          <form className="medicine-management-form" onSubmit={handleSubmit}>
            <div className="management-form-grid">
              <div className="management-field">
                <label>Medicine Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Panadol"
                />
              </div>

              <div className="management-field">
                <label>Generic Name</label>

                <input
                  type="text"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                  placeholder="Example: Paracetamol"
                />
              </div>

              <div className="management-field">
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: Pain Relief"
                />
              </div>

              <div className="management-field">
                <label>Manufacturer</label>

                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Manufacturer name"
                />
              </div>
            </div>

            <div className="management-field">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional medicine description"
                rows="4"
              />
            </div>

            <button
              className="save-medicine-button"
              type="submit"
              disabled={saving}
            >
              {editingId ? <FaSave /> : <FaPlus />}

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Medicine"
                  : "Add Medicine"}
            </button>
          </form>
        </section>

        {/* LIST */}

        <section className="medicine-list-card">
          <div className="medicine-list-heading">
            <div>
              <h2>Medicine Catalogue</h2>

              <p>
                {medicines.length} medicine
                {medicines.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="management-loading">Loading medicines...</div>
          ) : medicines.length === 0 ? (
            <div className="management-empty">No medicines found.</div>
          ) : (
            <div className="medicine-table-wrapper">
              <table className="medicine-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Generic Name</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {medicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td>
                        <strong>{medicine.name}</strong>
                      </td>

                      <td>{medicine.generic_name || "—"}</td>

                      <td>{medicine.category || "—"}</td>

                      <td>{medicine.manufacturer || "—"}</td>

                      <td>
                        <div className="medicine-actions">
                          <button
                            className="edit-medicine-button"
                            onClick={() => handleEdit(medicine)}
                          >
                            <FaEdit />
                            Edit
                          </button>

                          <button
                            className="delete-medicine-button"
                            onClick={() => handleDelete(medicine)}
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MedicineManagement;
