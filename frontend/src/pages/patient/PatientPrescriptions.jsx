import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';
import { ClipboardList, FileText, ArrowRight } from 'lucide-react';

export default function PatientPrescriptions() {
  const { session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => apiRequest('/api/prescriptions', {}, session), // Filtered by RLS policies
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const prescriptions = data?.data || [];

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">My Prescriptions</h1>
          <p className="page-subtitle">Your digitized medical records.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {prescriptions.length === 0 && (
          <EmptyState title="No prescriptions" message="You don't have any prescriptions in the system yet." icon={ClipboardList} />
        )}
        {prescriptions.map(pres => (
          <Link key={pres.id} to={`/patient/prescriptions/${pres.id}`} className="card card-body hover:border-brand-300 hover:shadow-md transition-all no-underline block sm:flex items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-surface-200">
                <FileText className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 flex items-center gap-2">
                  Prescription Record
                  <StatusBadge status={pres.status} />
                </p>
                <div className="flex items-center gap-3 text-sm text-surface-500 mt-1">
                  <span className="font-mono text-xs">ID: {pres.id.split('-')[0]}</span>
                  <span>•</span>
                  <span>{new Date(pres.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm font-medium text-brand-600 sm:ml-4">
              View Details <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
