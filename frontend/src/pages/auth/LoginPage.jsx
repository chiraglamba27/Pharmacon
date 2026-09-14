import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Pill, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function LoginPage() {
  const { signIn, signUp, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { show, ToastContainer } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dashboardPath = {
    admin: '/admin', doctor: '/doctor', pharmacist: '/pharmacist',
    clinic_staff: '/clinic', patient: '/patient',
  }[role] || '/dashboard';

  // Already logged in
  if (isAuthenticated) {
    navigate(location.state?.from?.pathname || dashboardPath, { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email.trim(), password, firstName.trim(), lastName.trim());
        show('Registration successful! You can now log in.', 'success');
        setIsRegister(false);
        setPassword('');
      } else {
        await signIn(email.trim(), password);
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-50">
      <ToastContainer />
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card">
          <div className="card-header text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-xl mb-3">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-surface-900">
              {isRegister ? 'Create an Account' : 'Sign in to Pharmacon'}
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              {isRegister ? 'Enter your details to get started' : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="alert-danger">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Names - Only for Register */}
              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="John"
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input pr-10"
                    disabled={loading}
                    minLength={isRegister ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isRegister && <p className="text-xs text-surface-500 mt-1">Must be at least 6 characters</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isRegister ? 'Signing up...' : 'Signing in...'}
                  </span>
                ) : (isRegister ? 'Sign up' : 'Sign in')}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-surface-600">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setIsRegister(false); setError(''); }} className="text-brand-600 font-semibold hover:underline">
                    Sign in here
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => { setIsRegister(true); setError(''); }} className="text-brand-600 font-semibold hover:underline">
                    Sign up here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-surface-400 mt-4">
          <Link to="/" className="hover:text-surface-600">← Back to project website</Link>
        </p>
      </div>
    </div>
  );
}
