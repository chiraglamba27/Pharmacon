import React, { useState } from 'react';
import {
  Upload, ClipboardList, Users, AlertTriangle, CheckCircle2,
  Eye, Plus, FileText, Check, X, Stethoscope, Search, Sparkles
} from 'lucide-react';
import MedicinePillMascot from '../../components/MedicinePillMascot';
import { Link } from 'react-router-dom';

interface ReviewQueueItem {
  id: string;
  patient: string;
  doctor: string;
  medicine: string;
  time: string;
  flaggedFields: { field: string; detectedValue: string; confidence: number; resolved: boolean }[];
}

export default function ClinicDashboard() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([
    {
      id: 'RX-2026-0091',
      patient: 'Sunil Reddy',
      doctor: 'Dr. A. Sharma',
      medicine: 'Amoxicillin 500mg',
      time: 'Just now',
      flaggedFields: [
        { field: 'Frequency', detectedValue: '1-0-1 (ambiguous)', confidence: 84, resolved: false },
        { field: 'Duration', detectedValue: '5 days', confidence: 94, resolved: true },
      ],
    },
    {
      id: 'RX-2026-0092',
      patient: 'Kavita Nair',
      doctor: 'Dr. S. Verma',
      medicine: 'Metformin 500mg',
      time: '8 mins ago',
      flaggedFields: [
        { field: 'Dosage Form', detectedValue: 'Tab vs Cap', confidence: 81, resolved: false },
        { field: 'Instructions', detectedValue: 'Before meals', confidence: 86, resolved: false },
      ],
    },
  ]);

  const [activeReview, setActiveReview] = useState<ReviewQueueItem | null>(null);
  const [notification, setNotification] = useState('');

  const handleResolveField = (fieldIdx: number) => {
    if (!activeReview) return;
    const updatedFlags = activeReview.flaggedFields.map((f, i) =>
      i === fieldIdx ? { ...f, resolved: true, confidence: 99 } : f
    );
    const updatedReview = { ...activeReview, flaggedFields: updatedFlags };
    setActiveReview(updatedReview);
    setQueue((prev) => prev.map((item) => (item.id === activeReview.id ? updatedReview : item)));
  };

  const handleCompleteVerification = () => {
    if (!activeReview) return;
    setQueue((prev) => prev.filter((item) => item.id !== activeReview.id));
    setNotification(`Prescription ${activeReview.id} verified and released to Pharmacy queue!`);
    setActiveReview(null);
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={28} mood="smart" />
            <span className="pill-tag-pink">Clinic Staff Workspace</span>
            <span className="pill-tag">Role: Clinic Staff (Active)</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Clinic Intake & Transcription Review Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            Intake incoming handwritten paper prescriptions, verify low-confidence OCR transcriptions, and route to attending doctors.
          </p>
        </div>

        <Link to="/prototype" className="btn-tactile btn-tactile-gold">
          <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Launch Rx Intake Scanner</span>
          </span>
        </Link>
      </div>

      {notification && (
        <div className="p-4 bg-[#E0F5EE] border-2 border-[#351027] rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-tactile-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── Review Queue & Uncertainty Verification ──────────────────────── */}
      <div className="card-tactile p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              Uncertainty Review Queue (Low-Confidence OCR Flags)
            </h2>
          </div>
          <span className="pill-tag-pink text-[10px]">{queue.length} Pending Verifications</span>
        </div>

        <div className="grid gap-3">
          {queue.length === 0 ? (
            <div className="p-8 text-center bg-[#E0F5EE] rounded-2xl border-2 border-[#351027]">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
              <div className="font-display font-extrabold text-base text-emerald-950">
                All Prescriptions Verified!
              </div>
              <div className="text-xs text-emerald-800 font-medium">
                No flagged prescription fields require staff attention at this time.
              </div>
            </div>
          ) : (
            queue.map((item) => {
              const unresolvedCount = item.flaggedFields.filter((f) => !f.resolved).length;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FFF8E8] border-2 border-[#351027] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-tactile-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm text-[#351027]">
                        {item.patient}
                      </span>
                      <span className="text-[10px] font-mono text-[#351027]/60 font-bold">
                        ({item.id}) · Attending: {item.doctor}
                      </span>
                    </div>
                    <div className="text-xs text-[#351027] font-bold mt-1">
                      Medication: <strong className="text-[#F52F4F]">{item.medicine}</strong> · Flagged: {unresolvedCount} fields needing manual check
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveReview(item)}
                    className="btn-tactile btn-tactile-dark"
                  >
                    <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Review & Confirm
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Verification Modal ───────────────────────────────────────────── */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-[#351027]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF8E8] border-[3.5px] border-[#351027] rounded-4xl p-6 sm:p-8 max-w-xl w-full shadow-tactile-xl relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#351027]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F52F4F]" />
                <h3 className="heading-chunky text-lg text-[#351027]">
                  Transcription Verification: {activeReview.patient}
                </h3>
              </div>
              <button onClick={() => setActiveReview(null)} className="text-[#351027]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#351027]/80 font-medium">
              Review flagged fields where handwriting confidence was below the 90% threshold. Confirm or override the detected value:
            </p>

            <div className="space-y-3">
              {activeReview.flaggedFields.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border-2 border-[#351027] flex items-center justify-between gap-3 ${
                    flag.resolved ? 'bg-[#E0F5EE]' : 'bg-[#FFE8ED]'
                  }`}
                >
                  <div>
                    <div className="text-[10px] uppercase font-extrabold text-[#351027]/70">
                      {flag.field}
                    </div>
                    <div className="text-xs font-extrabold text-[#351027] mt-0.5">
                      Detected: {flag.detectedValue}
                    </div>
                    <div className="text-[9px] font-bold text-[#F52F4F]">
                      Confidence: {flag.confidence}%
                    </div>
                  </div>

                  {flag.resolved ? (
                    <span className="px-2.5 py-1 rounded-full bg-white border border-[#351027] text-[10px] font-extrabold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveField(idx)}
                      className="btn-tactile btn-tactile-gold"
                    >
                      <span className="btn-tactile-inner py-1 px-3 text-[10px] font-bold">
                        Confirm Value ✓
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#351027]/10">
              <button onClick={() => setActiveReview(null)} className="btn-tactile btn-tactile-white">
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-bold">Cancel</span>
              </button>
              <button
                onClick={handleCompleteVerification}
                disabled={activeReview.flaggedFields.some((f) => !f.resolved)}
                className="btn-tactile btn-tactile-dark"
              >
                <span className="btn-tactile-inner py-1.5 px-5 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Release to Pharmacy
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
