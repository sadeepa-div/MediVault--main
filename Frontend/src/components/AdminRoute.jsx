import { Navigate } from "react-router-dom";

import { readAuthToken, readAuthUser } from "../session";

function AdminRoute({ children }) {
  const token = readAuthToken();
  const user = readAuthUser();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
0