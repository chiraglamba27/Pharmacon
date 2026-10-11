import React, { useState, useEffect } from 'react';
import {
  Upload, AlertTriangle, CheckCircle2,
  Eye, Check, X, Sparkles, RefreshCw, Stethoscope, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface FlaggedField {
  id?: number;
  field: string;
  detectedValue: string;
  confidence: number;
  resolved: boolean;
}

interface ReviewQueueItem {
  id: string;
  patient: string;
  doctor: string;
  medicine: string;
  time: string;
  flaggedFields: FlaggedField[];
}

export default function ClinicDashboard() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState<ReviewQueueItem | null>(null);
  const [notification, setNotification] = useState('');
  const [editedValues, setEditedValues] = useState<{ [key: number]: string }>({});

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ prescriptions: any[] }>('/prescriptions?status=draft');
      if (data?.prescriptions) {
        const mapped: ReviewQueueItem[] = data.prescriptions.map((p) => {
          const medField = p.fields?.find((f: any) => f.label?.toLowerCase().includes('med'))?.value || 'Prescription Intake';
          const flagged: FlaggedField[] = (p.fields || [])
            .filter((f: any) => f.needs_verification === 1 || f.confidence < 90)
            .map((f: any) => ({
              id: f.id,
              field: f.label,
              detectedValue: f.value,
              confidence: f.confidence,
              resolved: f.needs_verification === 0,
            }));

          // If no fields are flagged, create a default check
          const flaggedFields = flagged.length > 0 ? flagged : [
            { field: 'Dosage Verification', detectedValue: 'Standard dosage check', confidence: 85, resolved: false }
          ];

          return {
            id: p.id,
            patient: p.patient_name || 'Walk-in Patient',
            doctor: p.doctor_name || 'Attending Physician',
            medicine: medField,
            time: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            flaggedFields,
          };
        });
        setQueue(mapped);
      }
    } catch (err) {
      console.error('Failed to load clinic queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResolveField = async (fieldIdx: number) => {
    if (!activeReview) return;
    const target = activeReview.flaggedFields[fieldIdx];
    const finalVal = editedValues[fieldIdx] !== undefined ? editedValues[fieldIdx] : target.detectedValue;

    try {
      await api.put(`/prescriptions/${activeReview.id}/resolve-field`, {
        fieldId: target.id,
        fieldLabel: target.field,
        originalPrediction: target.detectedValue,
        correctedValue: finalVal,
        confidenceBefore: target.confidence,
      });

      const updatedFlags = activeReview.flaggedFields.map((f, i) =>
        i === fieldIdx ? { ...f, detectedValue: finalVal, resolved: true, confidence: 99 } : f
      );
      const updatedReview = { ...activeReview, flaggedFields: updatedFlags };
      setActiveReview(updatedReview);
      setQueue((prev) => prev.map((item) => (item.id === activeReview.id ? updatedReview : item)));
    } catch (err: any) {
      console.error('Failed to resolve field in DB:', err);
      alert('Error saving resolution: ' + (err.message || 'Check server connection'));
    }
  };

  const handleCompleteVerification = async () => {
    if (!activeReview) return;
    try {
      await api.put(`/prescriptions/${activeReview.id}/status`, { status: 'confirmed' });
      setQueue((prev) => prev.filter((item) => item.id !== activeReview.id));
      setNotification(`Prescription ${activeReview.id} verified in SQLite database & released to Pharmacy queue!`);
      setActiveReview(null);
      setTimeout(() => setNotification(''), 4500);
    } catch (err: any) {
      alert('Error updating status: ' + (err.message || 'Server error'));
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-teal">Clinic Staff Workspace</span>
            <span className="badge-slate">Logged in as: {user?.name || 'Clinic Staff'}</span>
            <span className="badge-green">SQLite Live DB</span>
          </div>
          <h1 className="page-title">Clinic Intake & Transcription Review</h1>
          <p className="page-subtitle">
            Review incoming handwritten prescriptions, resolve AI OCR uncertainty flags, and release verified records to pharmacy inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchQueue} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
          <Link to="/prototype" className="btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            Launch Rx Intake Scanner
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-900 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── Review Queue & Uncertainty Verification ──────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Intake Uncertainty Queue (Low-Confidence OCR Flags)
            </h2>
          </div>
          <span className="badge-yellow">{queue.length} Pending Verifications</span>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
              Loading real intake records from database...
            </div>
          ) : queue.length === 0 ? (
            <div className="p-10 text-center bg-emerald-50/50 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <div className="font-bold text-base text-emerald-950">
                All Prescriptions Verified!
              </div>
              <div className="text-sm text-emerald-700 mt-1 max-w-md mx-auto">
                No draft prescriptions require staff transcription checks at this time. Use the Rx Scanner to process new slips.
              </div>
            </div>
          ) : (
            queue.map((item) => {
              const unresolvedCount = item.flaggedFields.filter((f) => !f.resolved).length;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-slate-900">
                        {item.patient}
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        Attending: {item.doctor} · {item.time}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700 mt-1.5 flex items-center gap-2">
                      <span>Prescribed: <strong className="text-slate-900">{item.medicine}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className={unresolvedCount > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                        {unresolvedCount > 0 ? `${unresolvedCount} field(s) require manual check` : 'All fields verified'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveReview(item)}
                    className="btn-secondary"
                  >
                    <Eye className="w-4 h-4 mr-2 text-cyan-600" />
                    Review & Confirm
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Verification Modal ───────────────────────────────────────────── */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-5 border border-slate-200 animate-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Verify Transcription: {activeReview.patient}
                </h3>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Confirm or override detected handwriting values. Resolved fields are recorded in the database and audit trail:
            </p>

            <div className="space-y-3">
              {activeReview.flaggedFields.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    flag.resolved ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {flag.field}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      flag.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      OCR Confidence: {flag.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      disabled={flag.resolved}
                      value={editedValues[idx] !== undefined ? editedValues[idx] : flag.detectedValue}
                      onChange={(e) => setEditedValues({ ...editedValues, [idx]: e.target.value })}
                      className="form-input flex-1 font-mono text-sm"
                    />

                    {flag.resolved ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveField(idx)}
                        className="btn-primary text-xs whitespace-nowrap"
                      >
                        Confirm ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setActiveReview(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleCompleteVerification}
                disabled={activeReview.flaggedFields.some((f) => !f.resolved)}
                className="btn-primary disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Release to Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
