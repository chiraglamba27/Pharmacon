import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { UploadCloud, CheckSquare, Search } from 'lucide-react';

export default function ClinicDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Clinic Dashboard</h1>
          <p className="page-subtitle">Welcome back, {profile?.first_name}.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
        <Link to="/clinic/upload" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Upload Prescription</h2>
          <p className="text-sm text-surface-600">Digitize a new handwritten prescription and send it for AI extraction and review.</p>
        </Link>

        <Link to="/clinic/review" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer">
          <div className="w-12 h-12 bg-warning-light text-warning-dark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Review Queue</h2>
          <p className="text-sm text-surface-600">Review and correct prescriptions that failed automated extraction.</p>
        </Link>
      </div>

      <div className="card max-w-4xl mt-8">
        <div className="card-header">
          <h2 className="font-semibold text-surface-900">Patient Search</h2>
        </div>
        <div className="card-body">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input type="text" className="form-input pl-10" placeholder="Search patients by name or ID (Coming Soon)" disabled />
            </div>
            <button className="btn-secondary" disabled>Search</button>
          </div>
        </div>
      </div>
    </div>
  );
}
