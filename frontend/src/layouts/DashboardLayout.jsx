import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  Pill, LayoutDashboard, FileText, Package, Users, ClipboardList,
  Upload, CheckSquare, Calendar, RefreshCw, Settings, LogOut,
  ChevronLeft, ChevronRight, Brain, Stethoscope, ShieldCheck,
  AlertTriangle, Bell,
} from 'lucide-react';

const NAV_CONFIG = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/deliverables', label: 'Deliverables', icon: FileText },
    { to: '/admin/team', label: 'Team', icon: Users },
    { to: '/admin/files', label: 'Files', icon: Package },
    { to: '/admin/users', label: 'Users', icon: ShieldCheck },
    { to: '/admin/audit', label: 'Audit Logs', icon: ClipboardList },
    { to: '/admin/profile', label: 'Profile', icon: Settings },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/doctor/calibration', label: 'Calibration', icon: Brain },
    { to: '/doctor/profile', label: 'Profile', icon: Settings },
  ],
  pharmacist: [
    { to: '/pharmacist', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/pharmacist/inventory', label: 'Inventory', icon: Package },
    { to: '/pharmacist/dispensing', label: 'Dispensing', icon: CheckSquare },
    { to: '/pharmacist/refills', label: 'Refill Requests', icon: RefreshCw },
    { to: '/pharmacist/profile', label: 'Profile', icon: Settings },
  ],
  clinic_staff: [
    { to: '/clinic', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/clinic/upload', label: 'Upload Prescription', icon: Upload },
    { to: '/clinic/review', label: 'Review Queue', icon: CheckSquare },
    { to: '/clinic/profile', label: 'Profile', icon: Settings },
  ],
  patient: [
    { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/patient/prescriptions', label: 'My Prescriptions', icon: FileText },
    { to: '/patient/schedule', label: 'Schedule', icon: Calendar },
    { to: '/patient/refills', label: 'Refill Requests', icon: RefreshCw },
    { to: '/patient/profile', label: 'Profile', icon: Settings },
  ],
};

const ROLE_LABELS = {
  admin: 'Administrator', doctor: 'Doctor',
  pharmacist: 'Pharmacist', clinic_staff: 'Clinic Staff', patient: 'Patient',
};

export default function DashboardLayout({ role }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV_CONFIG[role] || [];

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className={`flex flex-col bg-white border-r border-surface-200 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-surface-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Pill className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-surface-900">Pharmacon</span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + signout */}
        <div className="border-t border-surface-100 p-3 space-y-1">
          {!collapsed && profile && (
            <div className="px-3 py-2 text-xs text-surface-500">
              <p className="font-semibold text-surface-700 truncate">{profile.first_name} {profile.last_name}</p>
              <p className="mt-0.5">{ROLE_LABELS[role]}</p>
            </div>
          )}
          <button onClick={handleSignOut}
            className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg text-surface-600 hover:bg-danger-light hover:text-danger-dark transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && 'Sign out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(v => !v)}
          className="flex items-center justify-center h-8 border-t border-surface-100 text-surface-400 hover:text-surface-600 hover:bg-surface-50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* ─── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-surface-200">
          <div />
          <div className="flex items-center gap-3">
            <button className="btn-ghost p-2" title="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            {profile && (
              <div className="text-right">
                <p className="text-sm font-medium text-surface-900">{profile.first_name} {profile.last_name}</p>
                <p className="text-xs text-surface-500">{ROLE_LABELS[role]}</p>
              </div>
            )}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
