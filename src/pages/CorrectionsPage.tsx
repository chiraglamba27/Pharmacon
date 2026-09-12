import { correctionHistory } from '../data/mockData';
import { Info, ArrowRight } from 'lucide-react';

export default function CorrectionsPage() {
  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Correction History</h1>
        <div className="prototype-banner">
          <Info className="w-3.5 h-3.5" />
          <span>Prototype Data</span>
        </div>
      </div>
      <p className="page-subtitle">Staff corrections to AI-extracted fields, intended as future learning data.</p>

      <div className="max-w-4xl space-y-4">
        {correctionHistory.map((record, i) => (
          <div key={record.id} className="card p-4 animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge-slate text-[10px]">{record.field}</span>
              <span className="text-xs text-slate-400">{record.prescriptionId}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">AI Prediction</div>
                <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-mono">
                  {record.originalPrediction}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-4" />
              <div className="flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Corrected Value</div>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-700 font-mono">
                  {record.correctedValue}
                </div>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span>Doctor: {record.doctorName}</span>
              <span>Staff: {record.staffMember}</span>
              <span>{record.timestamp}</span>
            </div>
          </div>
        ))}

        <div className="card p-4 bg-slate-50 border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            These corrections are intended future learning data. The prototype does not actually retrain 
            a production model — this demonstrates the proposed correction feedback loop.
          </p>
        </div>
      </div>
    </div>
  );
}
