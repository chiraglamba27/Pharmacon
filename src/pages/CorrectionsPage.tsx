import { useEffect, useState } from 'react';
import { Database, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

interface CorrectionRecord {
  id: string;
  prescriptionId: string;
  field: string;
  originalPrediction: string;
  correctedValue: string;
  confidenceBefore?: number;
  doctorName: string;
  staffMember: string;
  timestamp: string;
}

export default function CorrectionsPage() {
  const [corrections, setCorrections] = useState<CorrectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCorrections = () => {
    setLoading(true);
    api.get<{ corrections: CorrectionRecord[] }>('/corrections')
      .then((data) => {
        if (data.corrections) setCorrections(data.corrections);
      })
      .catch((err) => console.error('Failed to fetch corrections:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  return (
    <div className="page-container max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-teal">Active Feedback Loop</span>
            <span className="badge-green">SQLite Live DB</span>
          </div>
          <h1 className="page-title">OCR Correction & Calibration History</h1>
          <p className="page-subtitle">
            Staff and doctor corrections to AI-extracted fields, stored in SQLite to retrain doctor-specific handwriting models.
          </p>
        </div>

        <button onClick={fetchCorrections} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
            Loading corrections from SQLite database...
          </div>
        ) : corrections.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500">
            No corrections logged in database yet.
          </div>
        ) : (
          corrections.map((record, i) => (
            <div key={record.id} className="card p-5 hover:border-slate-300 transition-all shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="badge-blue text-xs">{record.field}</span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {record.prescriptionId}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{record.timestamp}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <div className="flex-1 bg-rose-50/70 border border-rose-200 p-3 rounded-xl">
                  <div className="text-[10px] text-rose-700 uppercase font-bold tracking-wider mb-1">
                    AI OCR Detection
                  </div>
                  <div className="text-sm text-rose-900 font-mono font-bold">
                    {record.originalPrediction}
                  </div>
                </div>

                <div className="flex items-center justify-center p-1">
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>

                <div className="flex-1 bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
                  <div className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider mb-1">
                    Staff Verified Correction
                  </div>
                  <div className="text-sm text-emerald-900 font-mono font-bold">
                    {record.correctedValue}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span>Attending Physician: <strong className="text-slate-700">{record.doctorName}</strong></span>
                  <span>•</span>
                  <span>Verified By: <strong className="text-slate-700">{record.staffMember}</strong></span>
                </div>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced to calibration dataset
                </span>
              </div>
            </div>
          ))
        )}

        <div className="card p-4 bg-slate-50 border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            Every correction resolved by Clinic Staff or Doctors in Pharmacon is permanently committed to the SQLite <code className="font-mono text-cyan-700">corrections</code> table with full actor attribution and confidence deltas.
          </p>
        </div>
      </div>
    </div>
  );
}
