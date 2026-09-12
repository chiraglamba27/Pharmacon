import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, FolderOpen, Users, Layout, FlaskConical, Shield, BarChart3, Map,
  UsersRound, Presentation, GitBranch, Settings, LogOut,
  FileText, Pill, Stethoscope, ClipboardList, Package, Activity,
  User, Menu, X, Grid3X3, LogIn
} from 'lucide-react';
import { useState } from 'react';

const mainNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/project', label: 'Project', icon: FolderOpen },
  { path: '/problem-users', label: 'Problem & Users', icon: Users },
  { path: '/proposed-system', label: 'Proposed System', icon: Layout },
  { path: '/prototype', label: 'Prototype', icon: FlaskConical },
  { path: '/validation', label: 'Validation', icon: Shield },
  { path: '/feasibility', label: 'Feasibility & Risk', icon: BarChart3 },
  { path: '/evaluation', label: 'Evaluation', icon: BarChart3 },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/team', label: 'Team', icon: UsersRound },
  { path: '/presentations', label: 'Presentations', icon: Presentation },
  { path: '/software-grid', label: 'Software Grid', icon: Grid3X3 },
  { path: '/versions', label: 'Versions', icon: GitBranch },
];

const dashboardNavItems = [
  { path: '/dashboard/doctor', label: 'Doctor Portal', icon: Stethoscope },
  { path: '/dashboard/clinic', label: 'Clinic Portal', icon: ClipboardList },
  { path: '/dashboard/pharmacy', label: 'Pharmacy Portal', icon: Package },
  { path: '/dashboard/patient', label: 'Patient Portal', icon: User },
  { path: '/dashboard/admin', label: 'Admin Portal', icon: Settings },
];

const systemNavItems = [
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/doctor-adaptation', label: 'Doctor Adaptation', icon: FileText },
  { path: '/corrections', label: 'Corrections', icon: ClipboardList },
  { path: '/audit', label: 'Audit Trail', icon: Activity },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-slate-900 tracking-tight">Pharmacon</span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-0.5 uppercase tracking-wider">Prototype</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</div>
          <ul className="space-y-0.5">
            {mainNavItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={isActive(item.path) ? 'nav-link-active' : 'nav-link-inactive'}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Portals */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Portals</div>
          <ul className="space-y-0.5">
            {dashboardNavItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={isActive(item.path) ? 'nav-link-active' : 'nav-link-inactive'}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* System */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">System</div>
          <ul className="space-y-0.5">
            {systemNavItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={isActive(item.path) ? 'nav-link-active' : 'nav-link-inactive'}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User / Login */}
      <div className="border-t border-slate-100 p-3">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role.replace('-', ' ')}</div>
              </div>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-slate-600 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-md shadow-sm"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-60 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {navContent}
      </aside>
    </>
  );
}
