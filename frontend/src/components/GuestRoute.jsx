import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="route-loader">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/explore" />;
  }

  return <Outlet />;
};

export default GuestRoute;
