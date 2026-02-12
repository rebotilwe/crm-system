// src/components/Layout/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;