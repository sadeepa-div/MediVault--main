import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import MedicineSearch from "./pages/MedicineSearch";
import MedicineManagement from "./pages/MedicineManagement";
import PharmacyManagement from "./pages/PharmacyManagement";
import StockManagement from "./pages/StockManagement";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN / SIGNUP */}
        <Route path="/" element={<AuthPage />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* MEDICINE SEARCH */}
        <Route
          path="/medicine-search"
          element={
            <ProtectedRoute>
              <MedicineSearch />
            </ProtectedRoute>
          }
        />

        {/* MEDICINE MANAGEMENT - ADMIN ONLY */}
        <Route
          path="/medicine-management"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MedicineManagement />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* PHARMACY MANAGEMENT - ADMIN ONLY */}
        <Route
          path="/pharmacy-management"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <PharmacyManagement />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* STOCK MANAGEMENT - ADMIN ONLY */}
        <Route
          path="/stock-management"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <StockManagement />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
