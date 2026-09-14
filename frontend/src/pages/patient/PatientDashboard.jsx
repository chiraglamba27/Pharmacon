import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClipboardList, Pill, Calendar } from 'lucide-react';

export default function PatientDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="page-subtitle">Welcome back, {profile?.first_name}. Manage your health records securely.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        <Link to="/patient/prescriptions" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer block">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">My Prescriptions</h2>
          <p className="text-sm text-surface-600">View your digitized prescriptions and dispensing history.</p>
        </Link>

        <Link to="/patient/refills" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer block">
          <div className="w-12 h-12 bg-success-light text-success-dark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Pill className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Request Refills</h2>
          <p className="text-sm text-surface-600">Request a refill for your ongoing medications from the pharmacy.</p>
        </Link>

        <div className="card card-body border-dashed bg-surface-50 cursor-not-allowed">
          <div className="w-12 h-12 bg-surface-200 text-surface-400 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-500 mb-2">Medication Schedule</h2>
          <p className="text-sm text-surface-500">Coming in Phase 5: Get reminders for when to take your medicine.</p>
        </div>
      </div>
    </div>
  );
}
