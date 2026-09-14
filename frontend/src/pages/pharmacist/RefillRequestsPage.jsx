import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { ErrorState, EmptyState } from '../../components/States';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function RefillRequestsPage() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { show, ToastContainer } = useToast();
  
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['refills-pharmacist'],
    queryFn: () => apiRequest('/api/refills', {}, session),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/refills/${id}/approve`, { method: 'PATCH' }, session),
    onSuccess: () => {
      qc.invalidateQueries(['refills-pharmacist']);
      setSelectedRequest(null);
      show('Refill approved.', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/refills/${id}/reject`, { method: 'PATCH' }, session),
    onSuccess: () => {
      qc.invalidateQueries(['refills-pharmacist']);
      setSelectedRequest(null);
      show('Refill rejected.', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  return (
    <div>
      <ToastContainer />
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Refill Requests</h1>
          <p className="page-subtitle">Manage patient requests for medication refills.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient</th>
              <th>Prescription Ref</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full rounded" /></td></tr>)}
            {!isLoading && error && <tr><td colSpan={6}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && (data?.data || []).length === 0 && (
              <tr><td colSpan={6}><EmptyState title="No active refill requests" /></td></tr>
            )}
            {!isLoading && !error && (data?.data || []).map(r => (
              <tr key={r.id}>
                <td className="font-mono text-sm">{r.id.split('-')[0]}</td>
                <td className="font-medium">{r.profiles?.first_name} {r.profiles?.last_name}</td>
                <td className="font-mono text-xs">{r.prescription_id ? r.prescription_id.split('-')[0] : '—'}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td><span className={`badge ${r.status === 'APPROVED' ? 'badge-green' : r.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'}`}>{r.status}</span></td>
                <td>
                  {r.status === 'PENDING' && (
                    <button className="btn-primary btn-sm" onClick={() => setSelectedRequest(r)}>Review</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Review Refill Request">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-surface-500 text-xs">Patient</span>
                <span className="font-medium">{selectedRequest.profiles?.first_name} {selectedRequest.profiles?.last_name}</span>
              </div>
              <div>
                <span className="block text-surface-500 text-xs">Requested On</span>
                <span className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-surface-500 text-xs">Prescription Reference</span>
                <span className="font-mono">{selectedRequest.prescription_id || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-surface-500 text-xs">Patient Notes</span>
                <p className="bg-surface-50 p-2 rounded mt-1">{selectedRequest.notes || 'No additional notes provided.'}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
              <button onClick={() => rejectMutation.mutate(selectedRequest.id)} disabled={rejectMutation.isPending} className="btn-secondary text-danger">
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </button>
              <button onClick={() => approveMutation.mutate(selectedRequest.id)} disabled={approveMutation.isPending} className="btn-primary bg-success hover:bg-success-dark">
                <CheckCircle className="w-4 h-4 mr-1" /> Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
