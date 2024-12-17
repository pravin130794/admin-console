import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarLayout from './layouts/SidebarLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import GroupsPage from './pages/GroupsPage';


const App = () => {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/groups" element={<GroupsPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default App;
