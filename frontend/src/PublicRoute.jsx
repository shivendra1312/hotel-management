import { Navigate } from "react-router-dom";

// Agar user already logged in hai toh login/signup page nahi dikhao
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    // Role ke hisaab se redirect karo
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "superAdmin") return <Navigate to="/superAdmin/dashboard" replace />;
    if (user.role === "hotel") return <Navigate to="/hotel/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
