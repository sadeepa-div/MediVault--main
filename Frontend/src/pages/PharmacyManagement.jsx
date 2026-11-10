import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { dashboardRequest } from "../api/dashboardApi";

function PharmacyManagement() {
  const [pharmacies, setPharmacies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        setPharmacies(await dashboardRequest("/pharmacies"));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadPharmacies();
  }, []);

  const filteredPharmacies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return pharmacies;

    return pharmacies.filter((pharmacy) =>
      [
        pharmacy.name,
        pharmacy.address,
        pharmacy.city,
        pharmacy.phone,
        pharmacy.email,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
    );
  }, [pharmacies, query]);

  return (
    <section className="management-section">
      <div className="management-heading">
        <div>
          <h2>Pharmacy Management</h2>
          <p>Browse registered pharmacies and their contact details.</p>
        </div>
        <span className="read-only-badge">View only</span>
      </div>

      {error && <p className="management-alert management-error" role="alert">{error}</p>}

      <label className="management-search">
        <FaSearch />
        <input
          aria-label="Search pharmacies"
          placeholder="Search name, location, or contact"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {loading ? (
        <p className="management-empty">Loading pharmacies...</p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>Address</th>
                <th>City</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id}>
                  <td>{pharmacy.name}</td>
                  <td>{pharmacy.address}</td>
                  <td>{pharmacy.city || "—"}</td>
                  <td>{pharmacy.phone || "—"}</td>
                  <td>{pharmacy.email || "—"}</td>
                </tr>
              ))}
              {filteredPharmacies.length === 0 && (
                <tr>
                  <td colSpan={5} className="management-empty">
                    No pharmacies found.
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

export default PharmacyManagement;
