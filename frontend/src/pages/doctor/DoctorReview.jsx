import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Edit3 } from 'lucide-react';

export default function DoctorReview() {
  const { id } = useParams();
  const { session } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { show, ToastContainer } = useToast();

  const [correctingField, setCorrectingField] = useState(null);
  const [correctedValue, setCorrectedValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => apiRequest(`/api/prescriptions/${id}`, {}, session),
  });

  const pres = data?.data;

  // Mutations
  const correctMutation = useMutation({
    mutationFn: (body) => apiRequest(`/api/prescriptions/${id}/corrections`, { method: 'POST', body: JSON.stringify(body) }, session),
    onSuccess: () => {
      qc.invalidateQueries(['prescription', id]);
      setCorrectingField(null);
      setCorrectedValue('');
      setCorrectionReason('');
      show('Correction saved', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  const confirmMutation = useMutation({
    mutationFn: () => apiRequest(`/api/prescriptions/${id}/confirm`, { method: 'POST' }, session),
    onSuccess: () => {
      qc.invalidateQueries(['prescription', id]);
      show('Prescription confirmed', 'success');
      setTimeout(() => navigate('/doctor/prescriptions'), 1500);
    },
    onError: (err) => show(err.message, 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) => apiRequest(`/api/prescriptions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }, session),
    onSuccess: () => {
      qc.invalidateQueries(['prescription', id]);
      setShowRejectModal(false);
      show('Prescription rejected', 'success');
      setTimeout(() => navigate('/doctor/prescriptions'), 1500);
    },
    onError: (err) => show(err.message, 'error'),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;
  if (!pres) return <EmptyState title="Not found" />;

  const fields = pres.prescription_extraction_fields || [];
  const needsReview = fields.filter(f => f.needs_review && !f.is_corrected);
  const canConfirm = pres.status === 'CORRECTED' || pres.status === 'PENDING_DOCTOR_CONFIRMATION' || pres.status === 'NEEDS_REVIEW'; // if they are happy with needs_review as is

  function openCorrection(f) {
    setCorrectingField(f);
    setCorrectedValue(f.is_corrected ? f.corrected_value : (f.extracted_value || ''));
    setCorrectionReason('');
  }

  function submitCorrection(e) {
    e.preventDefault();
    correctMutation.mutate({
      field_name: correctingField.field_name,
      corrected_value: correctedValue,
      reason: correctionReason,
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <ToastContainer />
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="page-header mb-6">
        <div>
          <h1 className="page-title flex items-center gap-3">
            Review Prescription
            <StatusBadge status={pres.status} />
          </h1>
          <p className="font-mono text-xs text-surface-500 mt-1">{pres.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowRejectModal(true)} disabled={rejectMutation.isPending || pres.status === 'REJECTED' || pres.status === 'CONFIRMED'} className="btn-secondary text-danger">
            <XCircle className="w-4 h-4" /> Reject
          </button>
          <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending || !canConfirm || pres.status === 'CONFIRMED'} className="btn-primary">
            <CheckCircle className="w-4 h-4" /> Confirm
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Original Image */}
        <div>
          <div className="card">
            <div className="card-header bg-surface-50 border-b border-surface-200">
              <h3 className="font-semibold text-surface-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" /> Original File
              </h3>
            </div>
            <div className="p-4 bg-surface-100 min-h-[400px] flex items-center justify-center rounded-b-xl border border-t-0 border-surface-200">
              <div className="text-center space-y-4">
                <p className="text-sm text-surface-500">Image preview would be embedded here via signed URL.</p>
                <Link to={`/doctor/prescriptions/${id}`} className="btn-secondary btn-sm inline-flex no-underline">
                  View File Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Extracted Fields & Corrections */}
        <div>
          <div className="card card-body">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center justify-between">
              Extracted Information
              {needsReview.length > 0 && (
                <span className="badge badge-yellow flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {needsReview.length} require review
                </span>
              )}
            </h3>

            {fields.length === 0 ? (
              <p className="text-sm text-surface-500">No data extracted.</p>
            ) : (
              <div className="space-y-3">
                {fields.map(f => (
                  <div key={f.id} className={`p-3 rounded-lg border ${f.needs_review && !f.is_corrected ? 'border-amber-300 bg-amber-50' : 'border-surface-200 bg-white'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-semibold text-surface-600 uppercase tracking-wide">{f.field_name}</span>
                      <button onClick={() => openCorrection(f)} className="text-brand-600 hover:text-brand-800 p-1 rounded hover:bg-brand-50" title="Edit value">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="mt-1">
                      {f.is_corrected ? (
                        <div>
                          <p className="font-medium text-surface-900 line-through text-surface-400 decoration-danger decoration-2">{f.extracted_value || '(empty)'}</p>
                          <p className="font-medium text-success-dark text-lg mt-1">{f.corrected_value}</p>
                        </div>
                      ) : (
                        <p className={`font-medium text-lg ${f.needs_review ? 'text-amber-900' : 'text-surface-900'}`}>
                          {f.extracted_value || '(empty)'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Correction Modal */}
      <Modal open={!!correctingField} onClose={() => setCorrectingField(null)} title={`Correct Field: ${correctingField?.field_name}`}>
        <form onSubmit={submitCorrection} className="space-y-4">
          <div className="alert-info text-xs">Original value is permanently preserved for audit and model training.</div>
          <div>
            <label className="form-label text-xs uppercase tracking-wider text-surface-500 mb-1 block">AI Extracted Value</label>
            <p className="text-surface-900 font-medium p-3 bg-surface-100 rounded-lg border border-surface-200">
              {correctingField?.extracted_value || '(empty)'}
            </p>
          </div>
          <div>
            <label className="form-label">Corrected Value *</label>
            <input required autoFocus className="form-input" value={correctedValue} onChange={e => setCorrectedValue(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Reason (Optional)</label>
            <input className="form-input" placeholder="e.g. OCR misread, illegible" value={correctionReason} onChange={e => setCorrectionReason(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <button type="button" onClick={() => setCorrectingField(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={correctMutation.isPending} className="btn-primary">
              {correctMutation.isPending ? 'Saving...' : 'Save Correction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Prescription">
        <form onSubmit={e => { e.preventDefault(); rejectMutation.mutate(rejectReason); }} className="space-y-4">
          <div>
            <label className="form-label">Reason for rejection *</label>
            <textarea required rows={3} className="form-input" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Image too blurry, invalid signature" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <button type="button" onClick={() => setShowRejectModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={rejectMutation.isPending} className="btn-danger">
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Prescription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
