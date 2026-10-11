import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Activity, User, Stethoscope, Building2,
  UserCheck, Heart, ShieldCheck, ChevronDown, LogOut,
  Sparkles, FileText, Database, Layers, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardsOpen, setDashboardsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const dashboardLinks = [
    { name: 'Doctor Workspace', path: '/dashboard/doctor', role: 'Doctor', allowedRoles: ['doctor', 'admin'], icon: Stethoscope },
    { name: 'Pharmacy & Stock', path: '/dashboard/pharmacy', role: 'Pharmacist', allowedRoles: ['pharmacist', 'admin'], icon: Building2 },
    { name: 'Clinic Intake', path: '/dashboard/clinic', role: 'Staff', allowedRoles: ['clinic-staff', 'admin'], icon: UserCheck },
    { name: 'Patient Care', path: '/dashboard/patient', role: 'Patient', allowedRoles: ['patient', 'admin'], icon: Heart },
    { name: 'Admin Workspace', path: '/dashboard/admin', role: 'Admin', allowedRoles: ['admin', 'instructor'], icon: ShieldCheck },
    ...(user && (user.role === 'admin' || user.role === 'instructor') ? [
      { name: 'System DB (Admin)', path: '/db', role: 'Admin', allowedRoles: ['admin', 'instructor'], icon: Database }
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">Pharmacon</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">UCS503</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium -mt-0.5">Clinical Intelligence</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/') ? 'bg-slate-100 text-sky-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/prototype"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive('/prototype') ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Rx Scanner (OCR)</span>
              </Link>
              <Link
                to="/inventory"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/inventory') ? 'bg-slate-100 text-sky-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Formulary Inventory
              </Link>

              {/* Dashboards Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDashboardsOpen(!dashboardsOpen)}
                  onBlur={() => setTimeout(() => setDashboardsOpen(false), 200)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-slate-100 text-sky-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>Workspaces</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${dashboardsOpen ? 'rotate-180' : ''}`} />
                </button>

                {dashboardsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Role Workspaces
                    </div>
                    {dashboardLinks.map((item) => {
                      const Icon = item.icon;
                      const isPermitted = user ? item.allowedRoles.includes(user.role) : false;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isPermitted ? 'text-slate-600' : 'text-slate-400'}`} />
                            <span className={isPermitted ? 'font-medium text-slate-900' : 'text-slate-600'}>{item.name}</span>
                          </div>
                          {user && (
                            isPermitted ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Permitted
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                                <Lock className="w-2.5 h-2.5" />
                                <span>{item.role}</span>
                              </span>
                            )
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>


              <Link
                to="/audit"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/audit') ? 'bg-slate-100 text-sky-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Audit Trail
              </Link>

            </nav>
          </div>

          {/* Right Controls: User Profile & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    user.role === 'doctor' ? '/dashboard/doctor' :
                    user.role === 'pharmacist' ? '/dashboard/pharmacy' :
                    user.role === 'clinic-staff' ? '/dashboard/clinic' :
                    user.role === 'patient' ? '/dashboard/patient' :
                    '/dashboard/admin'
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Demo Roles</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-150">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/prototype"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-sky-700 hover:bg-sky-50"
            >
              Prescription Scanner (Live OCR)
            </Link>
            <Link
              to="/inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Formulary Inventory
            </Link>
            <Link
              to="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Audit Trail
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3">
              Workspaces
            </div>
            {dashboardLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between px-3">
                <span className="text-xs font-semibold text-slate-800">Signed in as {user.name}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold"
              >
                Sign In / Demo Roles
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
