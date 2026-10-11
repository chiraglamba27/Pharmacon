import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PrototypePage from './pages/PrototypePage';
import InventoryPage from './pages/InventoryPage';
import AuditPage from './pages/AuditPage';
import LoginPage from './pages/LoginPage';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ClinicDashboard from './pages/dashboards/ClinicDashboard';
import PharmacyDashboard from './pages/dashboards/PharmacyDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DbInspectorPage from './pages/DbInspectorPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-teal-500 selection:text-white antialiased">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Core Public Product Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/prototype" element={<PrototypePage />} />
          <Route path="/upload" element={<PrototypePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Role-Based Workspaces (Protected) */}
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/clinic"
            element={
              <ProtectedRoute allowedRoles={['clinic-staff', 'admin']}>
                <ClinicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy"
            element={
              <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRoles={['patient', 'admin']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'instructor']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Diagnostics (Protected) */}
          <Route
            path="/db"
            element={
              <ProtectedRoute allowedRoles={['admin', 'instructor']}>
                <DbInspectorPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
