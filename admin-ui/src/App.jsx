import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
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

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpPage />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<SidebarLayout />}>
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
