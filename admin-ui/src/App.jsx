import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppBarLayout from "./layouts/AppBarLayout";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import ProjectsPage from "./pages/ProjectsPage";
import DevicesPage from "./pages/DevicesPage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import OtpPage from "./pages/OtpPage";
import NotFoundPage from "./pages/NotFound";
import UnauthorizedPage from "./pages/Unauthorized";
import { AuthProvider, RequireAuth } from "./context/Auth";
import HostsPage from "./pages/HostsPage";

const RequireOtpParams = ({ children }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email");

  if (!email) {
    return <Navigate to="/login" replace />;
  }

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
            <Route path="/users" element={<UsersPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/hosts" element={<HostsPage />} />
          </Route>
        </Route>

        {/* Catch-all and Unauthorized Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
