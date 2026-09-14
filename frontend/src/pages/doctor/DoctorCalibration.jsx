import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { ErrorState, EmptyState } from '../../components/States';

export default function DoctorCalibration() {
  const { session } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctor-calibration'],
    queryFn: () => apiRequest('/api/calibration', {}, session),
  });

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Handwriting Calibration</h1>
          <p className="page-subtitle">Upload samples to train the AI recognition model to your specific handwriting.</p>
        </div>
        <button className="btn-primary" disabled>Upload Sample</button>
      </div>

      <div className="alert-warning mb-6">
        <p className="text-sm font-medium">Model Integration Pending</p>
        <p className="text-xs mt-1">Calibration samples can be uploaded and stored, but the model training pipeline is currently inactive.</p>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Sample Image</th>
              <th>Status</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={3}><div className="skeleton h-4 w-full rounded" /></td></tr>)}
            {!isLoading && error && <tr><td colSpan={3}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && (data?.data || []).length === 0 && (
              <tr><td colSpan={3}><EmptyState title="No calibration samples uploaded" /></td></tr>
            )}
            {!isLoading && !error && (data?.data || []).map(c => (
              <tr key={c.id}>
                <td>
                  <p className="text-sm font-medium">{c.file_assets?.original_name}</p>
                </td>
                <td><span className="badge badge-gray">{c.status}</span></td>
                <td className="text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
