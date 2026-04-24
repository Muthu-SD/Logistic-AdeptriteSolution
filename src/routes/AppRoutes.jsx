import { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import useStore from "../store/UseStore";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword from "../auth/ResetPassword.jsx";
import OtpVerification from "../auth/OtpVerification.jsx";

// Lazy loading components
const Login = lazy(() => import("../auth/Login"));

const AppRoutes = () => {
  const { isAuthenticated } = useStore();
  return (

    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route
        path="/login"
        element={
          <Suspense fallback={<div>Loading Login...</div>}>
            {isAuthenticated() ? (
              <Navigate
                to={useStore.getState().user?.role === "SUPERADMIN" ? "/superadmin" : "/"}
                replace
              />
            ) : (
              <Login />
            )}
          </Suspense>
        }
      />

      <Route
        path="/verify-otp"
        element={
          <Suspense fallback={<div>Loading OTP Verification...</div>}>
            <OtpVerification />
          </Suspense>
        }
      />

      {/* Route for ForgotPassword */}
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<div>Loading Forgot Password...</div>}>
            <ForgotPassword />
          </Suspense>
        }
      />

      {/* Route for ResetPassword */}
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<div>Loading ResetPassword ...</div>}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* =========================
          USER DASHBOARD
      ========================= */}

      <Route
        path="/"
        element={
          <Suspense fallback={<div>Loading Dashboard...</div>}>
            <ProtectedRoute
              roles={["USER", "ADMIN"]}
              element={<MainLayout />}
            />
          </Suspense>
        }
      />
      {/* =========================
          SUPERADMIN DASHBOARD
      ========================= */}
      <Route
        path="/superadmin"
        element={
          <Suspense fallback={<div>Loading Superadmin...</div>}>
            <ProtectedRoute
              roles={["SUPERADMIN"]}
              element={<MainLayout />}
            />
          </Suspense>
        }
      />

      {/* =========================
          FALLBACK
      ========================= */}

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

export default AppRoutes;
