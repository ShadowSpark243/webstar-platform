import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import KycPage from './pages/dashboard/KycPage'
import WalletPage from './pages/dashboard/WalletPage'
import ProjectsPage from './pages/dashboard/ProjectsPage'
import NetworkPage from './pages/dashboard/NetworkPage'
import AdminPanel from './pages/dashboard/AdminPanel' // WILL BE DELETED LATER

// New Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminLedger from './pages/admin/AdminLedger'
import AdminKyc from './pages/admin/AdminKyc'
import AdminNetwork from './pages/admin/AdminNetwork'
import AdminSettings from './pages/admin/AdminSettings'
import AdminProjects from './pages/admin/AdminProjects'

import { useAuth } from './context/AuthContext'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>Loading System...</div>;
  }

  if (!user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="kyc" element={<KycPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>

      {/* ADMIN CONTROL CENTER ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ledger" element={<AdminLedger />} />
        <Route path="kyc" element={<AdminKyc />} />
        <Route path="network" element={<AdminNetwork />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="projects" element={<AdminProjects />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes >
  )
}

export default App
