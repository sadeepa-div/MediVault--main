import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBoxes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave
} from "react-icons/fa";

import {
  readAuthToken,
  clearAuthSession
} from "../session";

import "./StockManagement.css";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

const emptyForm = {
  pharmacyId: "",
  medicineId: "",
  quantity: "",
  price: ""
};

function StockManagement() {
  const navigate = useNavigate();
  const token = readAuthToken();

  const [stock, setStock] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [formData, setFormData] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        stockResponse,
        pharmacyResponse,
        medicineResponse
      ] = await Promise.all([
        fetch(`${API_URL}/stock`, {
          headers
        }),

        fetch(`${API_URL}/pharmacies`, {
          headers
        }),

        fetch(`${API_URL}/medicines`, {
          headers
        })
      ]);

      if (
        stockResponse.status === 401 ||
        pharmacyResponse.status === 401 ||
        medicineResponse.status === 401
      ) {
        clearAuthSession();
        navigate("/");
        return;
      }

      const stockData =
        await stockResponse.json();

      const pharmacyData =
        await pharmacyResponse.json();

      const medicineData =
        await medicineResponse.json();

      if (!stockResponse.ok) {
        showMessage(
          stockData.message ||
            "Could not load stock.",
          "error"
        );
        return;
      }

      if (!pharmacyResponse.ok) {
        showMessage(
          pharmacyData.message ||
            "Could not load pharmacies.",
          "error"
        );
        return;
      }

      if (!medicineResponse.ok) {
        showMessage(
          medicineData.message ||
            "Could not load medicines.",
          "error"
        );
        return;
      }

      setStock(stockData);
      setPharmacies(pharmacyData);
      setMedicines(medicineData);

    } catch (error) {
      console.error(error);

      showMessage(
        "Cannot connect to the server.",
        "error"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setMessage("");
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.pharmacyId ||
      !formData.medicineId
    ) {
      showMessage(
        "Please select a pharmacy and medicine.",
        "error"
      );
      return;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0
    ) {
      showMessage(
        "Quantity must be 0 or greater.",
        "error"
      );
      return;
    }

    if (
      formData.price !== "" &&
      Number(formData.price) < 0
    ) {
      showMessage(
        "Price cannot be negative.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const method =
        editingId ? "PUT" : "POST";

      const url =
        editingId
          ? `${API_URL}/stock/${editingId}`
          : `${API_URL}/stock`;

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          pharmacyId:
            Number(formData.pharmacyId),

          medicineId:
            Number(formData.medicineId),

          quantity:
            Number(formData.quantity),

          price:
            formData.price === ""
              ? null
              : Number(formData.price)
        })
      });

      const data =
        await response.json();

      if (response.status === 401) {
        clearAuthSession();
        navigate("/");
        return;
      }

      if (response.status === 403) {
        showMessage(
          "Admin access required.",
          "error"
        );
        return;
      }

      if (!response.ok) {
        showMessage(
          data.message ||
            "Could not save stock.",
          "error"
        );
        return;
      }

      showMessage(
        editingId
          ? "Stock updated successfully."
          : "Stock saved successfully.",
        "success"
      );

      resetForm();

      await loadData();

    } catch (error) {
      console.error(error);

      showMessage(
        "Cannot connect to the server.",
        "error"
      );

    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      pharmacyId:
        String(item.pharmacy_id),

      medicineId:
        String(item.medicine_id),

      quantity:
        String(item.quantity),

      price:
        item.price === null ||
        item.price === undefined
          ? ""
          : String(item.price)
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (item) => {
    const confirmed =
      window.confirm(
        `Delete ${item.medicine_name} stock from ${item.pharmacy_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/stock/${item.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        clearAuthSession();
        navigate("/");
        return;
      }

      if (!response.ok) {
        showMessage(
          data.message ||
            "Could not delete stock.",
          "error"
        );
        return;
      }

      showMessage(
        "Stock deleted successfully.",
        "success"
      );

      if (editingId === item.id) {
        resetForm();
      }

      await loadData();

    } catch (error) {
      console.error(error);

      showMessage(
        "Cannot connect to the server.",
        "error"
      );
    }
  };

  return (
    <div className="stock-management-page">

      <header className="stock-header">

        <button
          className="stock-back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft />
          Dashboard
        </button>

        <div className="stock-title">

          <div className="stock-title-icon">
            <FaBoxes />
          </div>

          <div>
            <h1>
              Stock Management
            </h1>

            <p>
              Manage medicine stock for
              each pharmacy.
            </p>
          </div>

        </div>

      </header>


      <main className="stock-container">

        <section className="stock-form-card">

          <div className="stock-section-heading">

            <div>
              <h2>
                {editingId
                  ? "Edit Stock"
                  : "Add Stock"}
              </h2>

              <p>
                Select medicine and pharmacy,
                then enter quantity and price.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="stock-cancel-button"
                onClick={resetForm}
              >
                <FaTimes />
                Cancel
              </button>
            )}

          </div>


          {message && (
            <div
              className={`stock-message ${messageType}`}
            >
              {message}
            </div>
          )}


          <form
            className="stock-form"
            onSubmit={handleSubmit}
          >

            <div className="stock-form-grid">

              <div className="stock-field">

                <label>
                  Pharmacy *
                </label>

                <select
                  name="pharmacyId"
                  value={
                    formData.pharmacyId
                  }
                  onChange={handleChange}
                >
                  <option value="">
                    Select Pharmacy
                  </option>

                  {pharmacies.map(
                    (pharmacy) => (
                      <option
                        key={pharmacy.id}
                        value={pharmacy.id}
                      >
                        {pharmacy.name}
                        {pharmacy.city
                          ? ` - ${pharmacy.city}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              <div className="stock-field">

                <label>
                  Medicine *
                </label>

                <select
                  name="medicineId"
                  value={
                    formData.medicineId
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select Medicine
                  </option>

                  {medicines.map(
                    (medicine) => (
                      <option
                        key={medicine.id}
                        value={medicine.id}
                      >
                        {medicine.name}
                      </option>
                    )
                  )}

                </select>

              </div>


              <div className="stock-field">

                <label>
                  Quantity *
                </label>

                <input
                  type="number"
                  min="0"
                  name="quantity"
                  value={
                    formData.quantity
                  }
                  onChange={handleChange}
                  placeholder="50"
                />

              </div>


              <div className="stock-field">

                <label>
                  Price (Rs.)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={
                    formData.price
                  }
                  onChange={handleChange}
                  placeholder="125.00"
                />

              </div>

            </div>


            <button
              type="submit"
              className="stock-save-button"
              disabled={saving}
            >

              {editingId
                ? <FaSave />
                : <FaPlus />}

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Stock"
                  : "Add Stock"}

            </button>

          </form>

        </section>


        <section className="stock-list-card">

          <div className="stock-section-heading">

            <div>
              <h2>
                Current Stock
              </h2>

              <p>
                {stock.length}
                {" "}
                stock record
                {stock.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

          </div>


          {loading ? (

            <div className="stock-loading">
              Loading stock...
            </div>

          ) : stock.length === 0 ? (

            <div className="stock-empty">
              No stock records found.
            </div>

          ) : (

            <div className="stock-table-wrapper">

              <table className="stock-table">

                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Pharmacy</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {stock.map((item) => {

                    const quantity =
                      Number(item.quantity);

                    return (
                      <tr key={item.id}>

                        <td>
                          <strong>
                            {item.medicine_name}
                          </strong>

                          <small>
                            {item.generic_name ||
                              ""}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {item.pharmacy_name}
                          </strong>

                          <small>
                            {item.pharmacy_city ||
                              ""}
                          </small>
                        </td>

                        <td>
                          {quantity}
                        </td>

                        <td>
                          {item.price !== null &&
                          item.price !== undefined
                            ? `Rs. ${Number(
                                item.price
                              ).toFixed(2)}`
                            : "—"}
                        </td>

                        <td>

                          <span
                            className={
                              quantity > 0
                                ? "stock-status available"
                                : "stock-status unavailable"
                            }
                          >
                            {quantity > 0
                              ? "Available"
                              : "Out of Stock"}
                          </span>

                        </td>

                        <td>

                          <div className="stock-actions">

                            <button
                              className="stock-edit-button"
                              onClick={() =>
                                handleEdit(item)
                              }
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              className="stock-delete-button"
                              onClick={() =>
                                handleDelete(item)
                              }
                            >
                              <FaTrash />
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default StockManagement;