import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = {
    admin: '/admin', doctor: '/doctor', pharmacist: '/pharmacist',
    clinic_staff: '/clinic', patient: '/patient',
  }[role] || '/dashboard';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/project', label: 'Project' },
    { to: '/team', label: 'Team' },
    { to: '/presentations', label: 'Presentations' },
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/architecture', label: 'Architecture' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-surface-900 hover:text-brand-600 no-underline">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              Pharmacon
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <button onClick={() => navigate(dashboardPath)} className="btn-primary btn-sm">
                  Go to Dashboard
                </button>
              ) : (
                <Link to="/login" className="btn-primary btn-sm no-underline">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-100 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium rounded-lg no-underline ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAuthenticated
              ? <button onClick={() => { navigate(dashboardPath); setMobileOpen(false); }} className="btn-primary w-full mt-2">Dashboard</button>
              : <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full mt-2 block text-center no-underline">Login</Link>
            }
          </div>
        )}
      </header>

      {/* ─── Page content ─────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-surface-600 text-sm">
              <Pill className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-surface-900">Pharmacon</span>
              <span>— Semester Project, 2026</span>
            </div>
            <p className="text-xs text-surface-400">
              Prescription digitisation &amp; medication management platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
