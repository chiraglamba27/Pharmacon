import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { ErrorState, EmptyState } from '../../components/States';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';

export default function PatientRefills() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { show, ToastContainer } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['refills-patient'],
    queryFn: () => apiRequest('/api/refills/mine', {}, session),
  });

  const { data: presData } = useQuery({
    queryKey: ['patient-prescriptions-refill'],
    queryFn: () => apiRequest('/api/prescriptions', {}, session),
  });

  const refillMutation = useMutation({
    mutationFn: (body) => apiRequest('/api/refills', { method: 'POST', body: JSON.stringify(body) }, session),
    onSuccess: () => {
      qc.invalidateQueries(['refills-patient']);
      setShowModal(false);
      setSelectedPrescription('');
      setNotes('');
      show('Refill request submitted successfully.', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedPrescription) return;
    refillMutation.mutate({ prescription_id: selectedPrescription, notes });
  }

  const activePrescriptions = (presData?.data || []).filter(p => ['CONFIRMED', 'DISPENSING', 'DISPENSED'].includes(p.status));

  return (
    <div>
      <ToastContainer />
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">My Refill Requests</h1>
          <p className="page-subtitle">Track your medication refill requests.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Request New Refill</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Prescription Ref</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={5}><div className="skeleton h-4 w-full rounded" /></td></tr>)}
            {!isLoading && error && <tr><td colSpan={5}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && (data?.data || []).length === 0 && (
              <tr><td colSpan={5}><EmptyState title="No refill requests" /></td></tr>
            )}
            {!isLoading && !error && (data?.data || []).map(r => (
              <tr key={r.id}>
                <td className="font-mono text-sm">{r.id.split('-')[0]}</td>
                <td className="font-mono text-xs">{r.prescription_id ? r.prescription_id.split('-')[0] : '—'}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td><span className={`badge ${r.status === 'APPROVED' ? 'badge-green' : r.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'}`}>{r.status}</span></td>
                <td className="text-sm text-surface-500">{r.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Request New Refill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Select Prescription *</label>
            <select required className="form-input" value={selectedPrescription} onChange={e => setSelectedPrescription(e.target.value)}>
              <option value="">-- Choose a prescription --</option>
              {activePrescriptions.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id.split('-')[0]} - {new Date(p.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
            {activePrescriptions.length === 0 && (
              <p className="text-xs text-danger mt-1">You have no active prescriptions available for refill.</p>
            )}
          </div>
          <div>
            <label className="form-label">Notes / Special Instructions (Optional)</label>
            <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g., Need it by tomorrow morning"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={refillMutation.isPending || !selectedPrescription} className="btn-primary">
              {refillMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
