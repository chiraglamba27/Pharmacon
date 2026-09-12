import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PlanningPresentationV1Page from './pages/PlanningPresentationV1Page';
import PlanningPresentationV2Page from './pages/PlanningPresentationV2Page';
import AdminPublishPage from './pages/AdminPublishPage';
import ProjectPage from './pages/ProjectPage';
import ProblemUsersPage from './pages/ProblemUsersPage';
import ProposedSystemPage from './pages/ProposedSystemPage';
import PrototypePage from './pages/PrototypePage';
import ValidationPage from './pages/ValidationPage';
import FeasibilityPage from './pages/FeasibilityPage';
import EvaluationPage from './pages/EvaluationPage';
import TeamPage from './pages/TeamPage';
import PresentationsPage from './pages/PresentationsPage';
import VersionsPage from './pages/VersionsPage';
import InventoryPage from './pages/InventoryPage';
import DoctorAdaptationPage from './pages/DoctorAdaptationPage';
import AuditPage from './pages/AuditPage';
import CorrectionsPage from './pages/CorrectionsPage';
import LoginPage from './pages/LoginPage';
import SoftwareGridPage from './pages/SoftwareGridPage';
import DeliverableDetailPage from './pages/DeliverableDetailPage';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import ClinicDashboard from './pages/dashboards/ClinicDashboard';
import PharmacyDashboard from './pages/dashboards/PharmacyDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RoadmapPage from './pages/RoadmapPage';

import { useSmoothScroll } from './animations/useSmoothScroll';

function AppLayout() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-[#FFF8E8] text-[#351027] flex flex-col justify-between selection:bg-[#F52F4F] selection:text-[#FFF8E8] antialiased">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/presentation/v1" element={<PlanningPresentationV1Page />} />
          <Route path="/presentation/v2" element={<PlanningPresentationV2Page />} />
          <Route path="/admin/publish" element={<AdminPublishPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/problem-users" element={<ProblemUsersPage />} />
          <Route path="/proposed-system" element={<ProposedSystemPage />} />
          <Route path="/prototype" element={<PrototypePage />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/feasibility" element={<FeasibilityPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/presentations" element={<PresentationsPage />} />
          <Route path="/software-grid" element={<SoftwareGridPage />} />
          <Route path="/versions" element={<VersionsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/doctor-adaptation" element={<DoctorAdaptationPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/corrections" element={<CorrectionsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/deliverable/:id" element={<DeliverableDetailPage />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/clinic" element={<ClinicDashboard />} />
          <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="*" element={<HomePage />} />
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
