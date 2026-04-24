import { Navigate } from "react-router-dom";
import useStore from "../store/UseStore";

const ProtectedRoute = ({ element,  roles = []   }) => {
  const { user,isAuthenticated } = useStore();

    // Not logged in
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  // Role-based protection (optional)
  if (roles.length && !roles.includes(user?.role)) {
    console.warn("Access denied for role:", user.role);
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

export default ProtectedRoute;
