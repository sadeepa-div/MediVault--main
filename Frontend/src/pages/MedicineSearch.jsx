import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaArrowLeft,
  FaHospital,
  FaMapMarkerAlt,
  FaBoxes,
  FaMoneyBillWave,
  FaCapsules
} from "react-icons/fa";

import "./MedicineSearch.css";

const API_URL =
  (import.meta.env.VITE_API_URL || "/api")
    .replace(/\\/g, "/")
    .replace(/\/$/, "");

function MedicineSearch() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!search.trim()) {
      setMessage("Please enter a medicine name.");
      setResults([]);
      return;
    }

    const token =
      localStorage.getItem("medivault_token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/medicines/search?q=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "medivault_token"
          );

          localStorage.removeItem(
            "medivault_user"
          );

          navigate("/");
          return;
        }

        setMessage(
          data.message || "Search failed."
        );

        setResults([]);
        return;
      }

      setResults(data);

      if (data.length === 0) {
        setMessage(
          "No medicine found with that name."
        );
      }

    } catch (error) {
      console.error(error);

      setMessage(
        "Cannot connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-search-page">

      {/* HEADER */}

      <header className="medicine-search-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft />
          Dashboard
        </button>

        <div className="medicine-search-title">
          <FaCapsules />

          <div>
            <h1>Medicine Search</h1>

            <p>
              Check medicine availability
              across pharmacies.
            </p>
          </div>
        </div>

      </header>


      {/* SEARCH */}

      <section className="medicine-search-box">

        <h2>Find a Medicine</h2>

        <p>
          Search using the medicine name or
          generic name.
        </p>

        <form
          className="medicine-search-form"
          onSubmit={handleSearch}
        >

          <div className="medicine-search-input">

            <FaSearch />

            <input
              type="text"
              placeholder="Example: Panadol or Paracetamol"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

        </form>

      </section>


      {/* MESSAGE */}

      {message && (
        <div className="search-message">
          {message}
        </div>
      )}


      {/* RESULTS */}

      {results.length > 0 && (

        <section className="search-results-section">

          <div className="results-heading">

            <div>
              <h2>
                Search Results
              </h2>

              <p>
                {results.length}
                {" "}
                pharmacy record
                {results.length !== 1
                  ? "s"
                  : ""}
                {" "}
                found
              </p>
            </div>

          </div>


          <div className="medicine-result-list">

            {results.map(
              (item, index) => {

                const available =
                  item.quantity > 0;

                return (

                  <div
                    className="medicine-result-card"
                    key={`${item.pharmacy_id}-${index}`}
                  >

                    <div className="result-top">

                      <div>

                        <span className="medicine-label">
                          Medicine
                        </span>

                        <h3>
                          {item.medicine_name}
                        </h3>

                        <p>
                          {item.generic_name ||
                            "Generic name unavailable"}
                        </p>

                      </div>


                      <span
                        className={
                          available
                            ? "availability available"
                            : "availability unavailable"
                        }
                      >

                        {available
                          ? "Available"
                          : "Out of Stock"}

                      </span>

                    </div>


                    <div className="medicine-info-grid">

                      <div className="medicine-info">

                        <div className="info-icon">
                          <FaHospital />
                        </div>

                        <div>
                          <span>
                            Pharmacy
                          </span>

                          <strong>
                            {item.pharmacy_name ||
                              "Not available"}
                          </strong>
                        </div>

                      </div>


                      <div className="medicine-info">

                        <div className="info-icon">
                          <FaMapMarkerAlt />
                        </div>

                        <div>
                          <span>
                            Location
                          </span>

                          <strong>
                            {item.city ||
                              item.address ||
                              "Not available"}
                          </strong>
                        </div>

                      </div>


                      <div className="medicine-info">

                        <div className="info-icon">
                          <FaBoxes />
                        </div>

                        <div>
                          <span>
                            Stock
                          </span>

                          <strong>
                            {item.quantity ?? 0}
                          </strong>
                        </div>

                      </div>


                      <div className="medicine-info">

                        <div className="info-icon">
                          <FaMoneyBillWave />
                        </div>

                        <div>
                          <span>
                            Price
                          </span>

                          <strong>
                            {item.price
                              ? `Rs. ${item.price}`
                              : "Not available"}
                          </strong>
                        </div>

                      </div>

                    </div>


                    <div className="result-bottom">

                      <span>
                        Category:
                        {" "}
                        {item.category ||
                          "Not specified"}
                      </span>

                      <span>
                        Manufacturer:
                        {" "}
                        {item.manufacturer ||
                          "Not specified"}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      )}

    </div>
  );
}

export default MedicineSearch;