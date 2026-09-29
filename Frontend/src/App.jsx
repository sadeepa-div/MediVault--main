import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import MedicineSearch from "./pages/MedicineSearch";

import ProtectedRoute from "./components/ProtectedRoute";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
