import { Navigate } from "react-router-dom";
import { readAuthUser } from "../session";

function AdminRoute({ children }) {
  const user = readAuthUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
