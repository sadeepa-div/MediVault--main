import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { dashboardRequest } from "../api/dashboardApi";

const emptyMedicine = {
  name: "",
  genericName: "",
  category: "",
  manufacturer: "",
  description: "",
};

function MedicineManagement({ user }) {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyMedicine);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isAdmin = user?.role === "admin";

  const loadMedicines = async () => {
    setError("");
    try {
      const data = await dashboardRequest("/medicines");
      setMedicines(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const filteredMedicines = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return medicines;

    return medicines.filter((medicine) =>
      [
        medicine.name,
        medicine.generic_name,
        medicine.category,
        medicine.manufacturer,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [medicines, query]);

  const startAdd = () => {
    setEditingMedicine(null);
    setForm(emptyMedicine);
    setIsFormOpen(true);
    setMessage("");
    setError("");
  };

  const startEdit = (medicine) => {
    setEditingMedicine(medicine);
    setIsFormOpen(true);
    setForm({
      name: medicine.name || "",
      genericName: medicine.generic_name || "",
      category: medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
    });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const path = editingMedicine
        ? `/medicines/${editingMedicine.id}`
        : "/medicines";
      await dashboardRequest(path, {
        method: editingMedicine ? "PUT" : "POST",
        body: form,
      });
      setEditingMedicine(null);
      setIsFormOpen(false);
      setForm(emptyMedicine);
      setMessage(editingMedicine ? "Medicine updated." : "Medicine added.");
      await loadMedicines();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicine) => {
    if (!window.confirm(`Delete ${medicine.name}? This cannot be undone.`)) {
      return;
    }

    setError("");
    setMessage("");
    try {
      await dashboardRequest(`/medicines/${medicine.id}`, { method: "DELETE" });
      setMessage("Medicine deleted.");
      await loadMedicines();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <section className="management-section">
      <div className="management-heading">
        <div>
          <h2>Medicine Management</h2>
          <p>Browse the medicine catalogue{isAdmin ? " and manage its records." : "."}</p>
        </div>
        {isAdmin && (
          <button className="primary-action" type="button" onClick={startAdd}>
            <FaPlus /> Add medicine
          </button>
        )}
      </div>

      {isAdmin && isFormOpen && (
        <form className="medicine-form" onSubmit={handleSubmit}>
          <h3>{editingMedicine ? "Edit medicine" : "Add a medicine"}</h3>
          <div className="management-form-grid">
            <label>
              Name *
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label>
              Generic name
              <input
                maxLength={150}
                value={form.genericName}
                onChange={(event) => setForm({ ...form, genericName: event.target.value })}
              />
            </label>
            <label>
              Category
              <input
                maxLength={100}
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
            </label>
            <label>
              Manufacturer
              <input
                maxLength={150}
                value={form.manufacturer}
                onChange={(event) => setForm({ ...form, manufacturer: event.target.value })}
              />
            </label>
            <label className="management-form-wide">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
              />
            </label>
          </div>
          <div className="management-form-actions">
            <button className="primary-action" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingMedicine ? "Save changes" : "Add medicine"}
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingMedicine(null);
                setForm(emptyMedicine);
              }}
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      )}

      {!isAdmin && (
        <p className="management-note">
          You can view the catalogue. Admin access is required to add, edit, or delete medicines.
        </p>
      )}

      {error && <p className="management-alert management-error" role="alert">{error}</p>}
      {message && <p className="management-alert management-success" role="status">{message}</p>}

      <label className="management-search">
        <FaSearch />
        <input
          aria-label="Search medicines"
          placeholder="Search name, category, or manufacturer"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {loading ? (
        <p className="management-empty">Loading medicines...</p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Generic name</th>
                <th>Category</th>
                <th>Manufacturer</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{medicine.name}</td>
                  <td>{medicine.generic_name || "—"}</td>
                  <td>{medicine.category || "—"}</td>
                  <td>{medicine.manufacturer || "—"}</td>
                  {isAdmin && (
                    <td className="management-row-actions">
                      <button type="button" onClick={() => startEdit(medicine)}>Edit</button>
                      <button
                        className="danger-action"
                        type="button"
                        onClick={() => handleDelete(medicine)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="management-empty">
                    No medicines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default MedicineManagement;
