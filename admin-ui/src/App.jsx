import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppBarLayout from "./layouts/AppBarLayout";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import DevicesPage from "./pages/DevicesPage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import OtpPage from "./pages/OtpPage";
import NotFoundPage from "./pages/NotFound";
import UnauthorizedPage from "./pages/Unauthorized";
import { AuthProvider, RequireAuth } from "./context/Auth";

const RequireOtpParams = ({ children }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email");

  if (!email) {
    // Redirect to login if the required query parameter is missing
    return <Navigate to="/login" replace />;
  }

  // If the required query parameter is present, render the children
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/otp"
          element={
            <RequireOtpParams>
              <OtpPage />
            </RequireOtpParams>
          }
        />

        {/* Protected Routes with Sidebar */}
        <Route element={<AppBarLayout />}>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/devices" element={<DevicesPage />} />
          </Route>
        </Route>

        {/* Catch-all and Unauthorized Routes */}
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
