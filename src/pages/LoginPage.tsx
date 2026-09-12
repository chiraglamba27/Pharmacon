import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock, User, ArrowRight, ShieldCheck, CheckCircle2,
  Sparkles, KeyRound, Users, Stethoscope, Building2, UserCheck, Heart
} from 'lucide-react';
import MedicinePillMascot from '../components/MedicinePillMascot';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const roleAccounts = [
    {
      category: 'Project Admins (Full Access)',
      color: '#FFE8ED',
      accounts: [
        { username: 'aryan', name: 'Aryan Sharma', role: 'admin', target: '/admin/publish' },
        { username: 'aniket', name: 'Aniket Raj', role: 'admin', target: '/admin/publish' },
        { username: 'amitesh', name: 'Amitesh Kumar Singh', role: 'admin', target: '/admin/publish' },
        { username: 'chirag', name: 'Chirag Lamba', role: 'admin', target: '/admin/publish' },
      ],
    },
    {
      category: 'Healthcare Role Workspaces',
      color: '#E0F5EE',
      accounts: [
        { username: 'doctor', name: 'Dr. A. Sharma', role: 'doctor', target: '/dashboard/doctor', icon: Stethoscope },
        { username: 'pharmacy', name: 'Vikram Singh', role: 'pharmacist', target: '/dashboard/pharmacy', icon: Building2 },
        { username: 'staff', name: 'Priya Desai', role: 'clinic-staff', target: '/dashboard/clinic', icon: UserCheck },
        { username: 'patient', name: 'Rahul Kumar', role: 'patient', target: '/dashboard/patient', icon: Heart },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username.trim(), password.trim());
      if (!success) {
        setError('Invalid username or password');
        return;
      }
      redirectUser(username.trim());
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (uname: string) => {
    const allAccs = roleAccounts.flatMap((g) => g.accounts);
    const matched = allAccs.find((a) => a.username === uname.toLowerCase().trim());
    if (matched) {
      navigate(matched.target);
    } else {
      navigate('/admin/publish');
    }
  };

  const handleQuickLogin = async (account: { username: string; target: string; name: string; role: string }) => {
    setUsername(account.username);
    setPassword('admin123');
    setError('');
    setLoading(true);
    try {
      const success = await login(account.username, 'admin123');
      if (!success) {
        setError('This demo account is not provisioned in Supabase Auth yet.');
        return;
      }
      navigate(account.target);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    const userRole = user.role;
    const targetRoute =
      userRole === 'doctor' ? '/dashboard/doctor' :
      userRole === 'pharmacist' ? '/dashboard/pharmacy' :
      userRole === 'clinic-staff' ? '/dashboard/clinic' :
      userRole === 'patient' ? '/dashboard/patient' :
      '/admin/publish';

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="card-tactile p-8 space-y-4">
          <MedicinePillMascot size={48} mood="happy" sparkles={true} />
          <h2 className="heading-chunky text-2xl text-[#351027]">
            Signed in as {user.name}
          </h2>
          <p className="text-xs font-bold text-[#351027]/70">
            Active Role: <span className="pill-tag-pink uppercase tracking-wide">{user.role}</span>
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link to={targetRoute} className="btn-tactile btn-tactile-gold">
              <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold flex items-center gap-1.5">
                Go to Workspace Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <button onClick={logout} className="btn-tactile btn-tactile-white">
              <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <MedicinePillMascot size={42} mood="smart" sparkles={true} />
        </div>
        <h1 className="heading-chunky text-3xl sm:text-4xl text-[#351027]">
          Role-Based Access Sign In
        </h1>
        <p className="text-xs sm:text-sm text-[#351027]/70 font-medium max-w-lg mx-auto">
          Sign in with your credentials or click any role below to launch their active workspace with full operational tooling.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Sign In Form */}
        <div className="card-tactile p-6 sm:p-8 space-y-5">
          <h2 className="font-display font-extrabold text-lg text-[#351027] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#F52F4F]" />
            Enter Credentials
          </h2>

          {error && (
            <div className="p-3 bg-[#FFE8ED] border border-[#F52F4F] rounded-xl text-xs font-bold text-[#8F1230]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">
                Username / Role
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#351027]/50 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. doctor, pharmacy, staff, patient, or aryan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#351027]/50 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Password (admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-tactile btn-tactile-dark mt-2"
            >
              <span className="btn-tactile-inner py-2.5 text-xs font-extrabold flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </form>
        </div>

        {/* 1-Click Role Direct Launchers */}
        <div className="space-y-4">
          {roleAccounts.map((group, idx) => (
            <div
              key={idx}
              className="card-tactile p-5 space-y-3 border-2 border-[#351027]"
              style={{ backgroundColor: group.color }}
            >
              <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-[#351027]">
                {group.category} (Password: <code>admin123</code>)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.accounts.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="p-2.5 rounded-xl bg-white border border-[#351027] flex items-center justify-between text-left hover:scale-[1.02] active:scale-95 transition-all shadow-tactile-sm"
                  >
                    <div>
                      <div className="font-display font-extrabold text-xs text-[#351027]">
                        {acc.name}
                      </div>
                      <div className="text-[9px] text-[#351027]/60 font-medium">
                        <code>{acc.username}</code> · {acc.role}
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FFF8E8] border border-[#351027] text-[#351027]">
                      Launch ⚡
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
