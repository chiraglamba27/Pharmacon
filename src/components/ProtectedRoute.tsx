import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, LogIn, Loader2, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  // 1. If not logged in, redirect to login with return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If logged in but role not allowed, display Access Restricted (403)
  if (!allowedRoles.includes(user.role)) {
    const userWorkspace =
      user.role === 'doctor' ? '/dashboard/doctor' :
      user.role === 'pharmacist' ? '/dashboard/pharmacy' :
      user.role === 'clinic-staff' ? '/dashboard/clinic' :
      user.role === 'patient' ? '/dashboard/patient' :
      '/admin/publish';

    const formatRole = (r: string) => {
      switch (r) {
        case 'doctor': return 'Attending Doctor';
        case 'pharmacist': return 'Chief Pharmacist';
        case 'clinic-staff': return 'Clinic Staff';
        case 'patient': return 'Patient';
        case 'admin': return 'Project Admin';
        case 'instructor': return 'Course Instructor';
        default: return r;
      }
    };

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Access Restricted (403 Forbidden)
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Role Authorization Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              This clinical workspace is restricted to <span className="font-bold text-slate-800">{allowedRoles.map(formatRole).join(' or ')}</span> privileges.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Current User:</span>
              <span className="font-semibold text-slate-800">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Primary Email:</span>
              <span className="font-mono text-slate-700">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Role:</span>
              <span className="font-bold text-sky-700 uppercase tracking-wider text-[11px] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={userWorkspace}
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Go to My Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Switch Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is authenticated and authorized
  return <>{children}</>;
}
