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
import MedicineManagement from "./MedicineManagement";
import PharmacyManagement from "./PharmacyManagement";
import ProfileManagement from "./ProfileManagement";

import "./Dashboard.css";
import "./ManagementPages.css";

const API_URL = (import.meta.env.VITE_API_URL || "/api")
  .replace(/\\/g, "/")
  .replace(/\/$/, "");

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");

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
          <button
            className={activeView === "dashboard" ? "nav-active" : ""}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </button>

          <button onClick={() => navigate("/medicine-search")}>
            <FaSearch />
            Medicine Search
          </button>

          <button
            className={activeView === "medicines" ? "nav-active" : ""}
            onClick={() => setActiveView("medicines")}
          >
            <FaBoxes />
            Medicine Management
          </button>

          <button
            className={activeView === "pharmacies" ? "nav-active" : ""}
            onClick={() => setActiveView("pharmacies")}
          >
            <FaHospital />
            Pharmacy Management
          </button>

          <button
            className={activeView === "profile" ? "nav-active" : ""}
            onClick={() => setActiveView("profile")}
          >
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

        {activeView === "dashboard" && (
          <>
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

            <section className="quick-section">
              <h2>Quick Actions</h2>

              <div className="quick-actions">
                <button onClick={() => navigate("/medicine-search")}>
                  <FaSearch />
                  Search Medicine
                </button>

                <button onClick={() => setActiveView("medicines")}>
                  <FaCapsules />
                  Manage Medicines
                </button>

                <button onClick={() => setActiveView("pharmacies")}>
                  <FaHospital />
                  View Pharmacies
                </button>

                <button onClick={() => setActiveView("profile")}>
                  <FaUserCircle />
                  Edit Profile
                </button>
              </div>
            </section>

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
          </>
        )}

        {activeView === "medicines" && <MedicineManagement user={user} />}
        {activeView === "pharmacies" && <PharmacyManagement />}
        {activeView === "profile" && (
          <ProfileManagement user={user} onUserUpdated={setUser} />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
