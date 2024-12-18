import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import DevicesPage from "./pages/DevicesPage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Routes with Sidebar */}
      <Route element={<SidebarLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/devices" element={<DevicesPage />} />
      </Route>
    </Routes>
  );
};

export default App;
