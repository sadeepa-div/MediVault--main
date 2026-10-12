import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import MedicineSearch from "./pages/MedicineSearch";

import ProtectedRoute from "./components/ProtectedRoute";
import MedicineManagement from "./pages/MedicineManagement";

import AdminRoute from "./components/AdminRoute";
import PharmacyManagement from "./pages/PharmacyManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medicine-search"
          element={
            <ProtectedRoute>
              <MedicineSearch />
            </ProtectedRoute>
          }
        />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
