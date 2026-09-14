import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Pill, RefreshCcw } from 'lucide-react';

export default function PharmacistDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Pharmacist Dashboard</h1>
          <p className="page-subtitle">Welcome back, {profile?.first_name}.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
        <Link to="/pharmacist/dispensing" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer block">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Pill className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Dispensing</h2>
          <p className="text-sm text-surface-600">Dispense confirmed prescriptions. Stock is automatically updated.</p>
        </Link>

        <Link to="/pharmacist/inventory" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer block">
          <div className="w-12 h-12 bg-success-light text-success-dark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Inventory Management</h2>
          <p className="text-sm text-surface-600">Manage medicines, restock batches, and view low-stock alerts.</p>
        </Link>

        <Link to="/pharmacist/refills" className="card card-body hover:border-brand-400 hover:shadow-md transition-all no-underline group cursor-pointer block">
          <div className="w-12 h-12 bg-warning-light text-warning-dark rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Refill Requests</h2>
          <p className="text-sm text-surface-600">Review and approve patient refill requests.</p>
        </Link>
      </div>
    </div>
  );
}
