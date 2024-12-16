import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarLayout from './layouts/SidebarLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';

const App = () => {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default App;
