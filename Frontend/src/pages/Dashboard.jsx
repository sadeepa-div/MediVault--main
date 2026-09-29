import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaCapsules,
  FaHospital,
  FaBoxes,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import "./Dashboard.css";

const API_URL = (import.meta.env.VITE_API_URL || "/api")
  .replace(/\\/g, "/")
  .replace(/\/$/, "");

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("medivault_token");

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
          localStorage.removeItem("medivault_token");

          localStorage.removeItem("medivault_user");

          navigate("/");

          return;
        }

        setUser(data.user);

        const statsResponse = await fetch(`${API_URL}/medicines/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          setStats(await statsResponse.json());
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
    localStorage.removeItem("medivault_token");

    localStorage.removeItem("medivault_user");

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

          <button>
            <FaBoxes />
            Medicine Management
          </button>

          <button>
            <FaHospital />
            Pharmacy Management
          </button>

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
              <h2>{stats?.totalMedicines ?? "—"}</h2>
              <span>Registered in MediVault</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <FaBoxes />
            </div>

            <div>
              <p>Available Medicines</p>
              <h2>{stats?.availableMedicines ?? "—"}</h2>
              <span>With available stock</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <FaHospital />
            </div>

            <div>
              <p>Pharmacies</p>
              <h2>{stats?.totalPharmacies ?? "—"}</h2>
              <span>Registered pharmacies</span>
            </div>
          </div>
        </section>

        {/* QUICK ACTION */}

        <section className="quick-section">
          <h2>Quick Actions</h2>

          <div className="quick-actions">
            <button onClick={() => navigate("/medicine-search")}>
              <FaSearch />
              Search Medicine
            </button>

            <button>
              <FaCapsules />
              Manage Medicines
            </button>

            <button>
              <FaHospital />
              Manage Pharmacies
            </button>
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
