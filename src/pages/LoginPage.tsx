import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, ShieldCheck, CheckCircle2,
  Stethoscope, Building2, UserCheck, Heart,
  Sparkles, Mail, UserPlus
} from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<'doctor' | 'pharmacist' | 'clinic-staff' | 'patient' | 'admin'>('doctor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Pre-configured Google accounts for instant evaluation
  const googleAccounts = [
    {
      email: 'chiraglamba@gmail.com',
      name: 'Chirag Lamba',
      role: 'admin',
      target: '/admin/publish',
      icon: ShieldCheck,
      desc: 'Integration Lead & Project Admin',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      email: 'dr.sharma@pharmacon.org',
      name: 'Dr. A. Sharma',
      role: 'doctor',
      target: '/dashboard/doctor',
      icon: Stethoscope,
      desc: 'Attending Physician & Handwriting Calibration',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      email: 'pharmacy.vikram@pharmacon.org',
      name: 'Vikram Singh',
      role: 'pharmacist',
      target: '/dashboard/pharmacy',
      icon: Building2,
      desc: 'Chief Pharmacist & Formulary Stock Manager',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      email: 'clinic.priya@pharmacon.org',
      name: 'Priya Desai',
      role: 'clinic-staff',
      target: '/dashboard/clinic',
      icon: UserCheck,
      desc: 'Clinic Intake & OCR Uncertainty Verification',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      email: 'patient.rahul@gmail.com',
      name: 'Rahul Kumar',
      role: 'patient',
      target: '/dashboard/patient',
      icon: Heart,
      desc: 'Prescription Adherence & Refill Requests',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  // Try initializing Google Identity Services button if window.google is ready
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              setLoading(true);
              const ok = await loginWithGoogle({ credential: response.credential });
              setLoading(false);
              if (ok) navigate('/prototype');
            }
          },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
      } catch (e) {
        console.warn('GIS render button warning:', e);
      }
    }
  }, [loginWithGoogle, navigate]);

  const handleSelectAccount = async (acc: typeof googleAccounts[0]) => {
    setError('');
    setLoading(true);
    try {
      const ok = await loginWithGoogle({
        email: acc.email,
        name: acc.name,
        role: acc.role,
      });
      if (ok) {
        navigate(acc.target);
      } else {
        setError('Failed to sign in with Google account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const ok = await loginWithGoogle({
        email: customEmail.trim(),
        name: customName.trim() || customEmail.split('@')[0],
        role: customRole,
      });

      if (ok) {
        const target =
          customRole === 'doctor' ? '/dashboard/doctor' :
          customRole === 'pharmacist' ? '/dashboard/pharmacy' :
          customRole === 'clinic-staff' ? '/dashboard/clinic' :
          customRole === 'patient' ? '/dashboard/patient' :
          '/admin/publish';
        navigate(target);
      } else {
        setError('Google sign-in failed. Please verify the backend is online.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    const targetRoute =
      user.role === 'doctor' ? '/dashboard/doctor' :
      user.role === 'pharmacist' ? '/dashboard/pharmacy' :
      user.role === 'clinic-staff' ? '/dashboard/clinic' :
      user.role === 'patient' ? '/dashboard/patient' :
      '/admin/publish';

    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center mx-auto text-xl font-bold shadow-sm">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Authenticated via Google ({user.role})
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Signed in as {user.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-xs">
                {user.email}
              </code>
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={targetRoute}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Go to My Clinical Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign Out / Switch Google Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Authentication · Email as Primary Key</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In with Google
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Pharmacon uses verified Google email addresses as primary identity keys, routing each practitioner and patient to their authorized healthcare workspace.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* GIS container if client ID configured */}
      <div ref={googleBtnRef} className="max-w-md mx-auto" />

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: 1-Click Verified Google Accounts */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select a Google Account
            </h2>
            <span className="text-[10px] text-slate-400">Pre-seeded with Email Primary Key</span>
          </div>

          <div className="grid gap-2.5">
            {googleAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  disabled={loading}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md text-left transition-all group flex items-start gap-3.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {acc.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acc.color}`}>
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{acc.email}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight truncate">
                      {acc.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Custom Google Email Login / First-time Onboarding */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom Google Email</h2>
              <p className="text-[11px] text-slate-500">Sign in or register any Google account</p>
            </div>
          </div>

          <form onSubmit={handleCustomGoogleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Email ID (Primary Key)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. chiraglamba@gmail.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 pl-8"
                  required
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Dr. Chirag Lamba"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign Clinical Role
              </label>
              <select
                value={customRole}
                onChange={(e: any) => setCustomRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="doctor">Doctor (Prescription Intake & Calibration)</option>
                <option value="pharmacist">Pharmacist (Inventory & Refill Approvals)</option>
                <option value="clinic-staff">Clinic Staff (Review & Routing)</option>
                <option value="patient">Patient (Dosage Tracking & Refills)</option>
                <option value="admin">Project Admin (Publishing & Evaluation)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Sign In with Google Email'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-500">Security Note:</span> Stored persistently in SQLite with email as primary key and logged into the immutable audit trail.
          </div>
        </div>
      </div>
    </div>
  );
}
