import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, readAuthToken } from "../session";

import {
  FaCapsules,
  FaHospital,
  FaBoxes,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = readAuthToken();

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

        setUser(data.user);

        try {
          const summaryResponse = await fetch(`${API_URL}/medicines/summary`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const summaryData = await summaryResponse.json();

          if (!summaryResponse.ok) {
            setSummaryError(
              summaryData.message || "Could not load dashboard summary.",
            );
            return;
          }

          setSummary(summaryData);
        } catch (error) {
          console.error("Could not load dashboard summary:", error);
          setSummaryError("Could not load dashboard summary.");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  if (loading) {
    return <div className="dashboard-loading">Loading MediVault...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="dashboard-logo">
          <FaCapsules />
          <span>MediVault</span>
        </div>

        <nav>
          <button className="nav-active">Dashboard</button>

          <button onClick={() => navigate("/medicine-search")}>
            <FaSearch />
            Medicine Search
          </button>

          {user?.role === "admin" && (
            <button onClick={() => navigate("/medicine-management")}>
              <FaBoxes />
              Medicine Management
            </button>
          )}

          {user?.role === "admin" && (
            <button onClick={() => navigate("/pharmacy-management")}>
              <FaHospital />
              Pharmacy Management
            </button>
          )}

          <button>
            <FaUserCircle />
            Profile
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p>MEDIVAULT DASHBOARD</p>

            <h1>Welcome, {user?.fullName || "User"}</h1>

            <span>
              Manage pharmacy and medicine information from one place.
            </span>
          </div>

          <div className="user-box">
            <FaUserCircle />

            <div>
              <strong>{user?.fullName}</strong>

              <small>{user?.email}</small>
            </div>
          </div>
        </header>

        {/* STAT CARDS */}

        <section className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">
              <FaCapsules />
            </div>

            <div>
              <p>Total Medicines</p>
              <h2>{summary?.totalMedicines ?? "—"}</h2>
              <span>Medicines in the catalogue</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <FaBoxes />
            </div>

            <div>
              <p>Available Medicines</p>
              <h2>{summary?.availableMedicines ?? "—"}</h2>
              <span>Currently in stock at pharmacies</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <FaHospital />
            </div>

            <div>
              <p>Pharmacies</p>
              <h2>{summary?.pharmacies ?? "—"}</h2>
              <span>Registered pharmacies</span>
            </div>
          </div>
        </section>
        {summaryError && (
          <p className="dashboard-summary-error" role="alert">
            {summaryError}
          </p>
        )}

        {/* QUICK ACTION */}

        <section className="quick-section">
          <h2>Quick Actions</h2>

          <div className="quick-actions">
            <button onClick={() => navigate("/medicine-search")}>
              <FaSearch />
              Search Medicine
            </button>

            {user?.role === "admin" && (
              <button onClick={() => navigate("/medicine-management")}>
                <FaCapsules />
                Manage Medicines
              </button>
            )}

            {user?.role === "admin" && (
              <button onClick={() => navigate("/pharmacy-management")}>
                <FaHospital />
                Manage Pharmacies
              </button>
            )}
          </div>
        </section>

        {/* ACCOUNT */}

        <section className="account-section">
          <h2>Your Account</h2>

          <div className="account-information">
            <div>
              <span>Name</span>
              <strong>{user?.fullName}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user?.email}</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>{user?.role}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
