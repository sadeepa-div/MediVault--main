import { Navigate } from "react-router-dom";
import { readAuthToken } from "../session";

function ProtectedRoute({ children }) {
  const token = readAuthToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;