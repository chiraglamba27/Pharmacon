import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, Clock } from 'lucide-react';

export default function ClinicReviewQueue() {
  const { session } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => apiRequest('/api/prescriptions', {}, session),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const prescriptions = data?.data || [];
  
  // Filter for items needing attention (NEEDS_REVIEW or PROCESSING)
  const queue = prescriptions.filter(p => ['NEEDS_REVIEW', 'PROCESSING', 'UPLOADED'].includes(p.status));

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Review Queue</h1>
          <p className="page-subtitle">Prescriptions requiring manual review and correction.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID / File</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 && (
              <tr><td colSpan={5}><EmptyState title="Queue is empty" message="No prescriptions currently need review." icon={ClipboardList} /></td></tr>
            )}
            {queue.map(pres => (
              <tr key={pres.id}>
                <td>
                  <p className="font-mono text-xs font-semibold text-surface-900">{pres.id.split('-')[0]}</p>
                  <p className="text-xs text-surface-500 truncate max-w-[200px]">{pres.file_assets?.original_name || 'No file'}</p>
                </td>
                <td className="text-sm">Clinic Staff</td>
                <td className="text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-surface-400" /> {new Date(pres.created_at).toLocaleString()}</td>
                <td><StatusBadge status={pres.status} /></td>
                <td>
                  {pres.status === 'NEEDS_REVIEW' ? (
                    <Link to={`/clinic/prescriptions/${pres.id}`} className="btn-primary btn-sm no-underline">
                      Review <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-surface-500 italic">Processing...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
