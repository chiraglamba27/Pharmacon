import React, { useState } from 'react';
import {
  FileText, CheckCircle2, ShieldCheck, Sparkles,
  Clock, Pill, Building2, ChevronRight, Activity, Zap
} from 'lucide-react';
import MedicinePillMascot from './MedicinePillMascot';

export default function PhoneShowcase() {
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. A. Sharma');

  return (
    <div
      data-anim="phone-showcase"
      className="pt-10 sm:pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end max-w-5xl mx-auto text-left relative"
    >
      {/* ─── Left Phone: Doctor-Adaptive Handwriting OCR ────────────────── */}
      <div
        data-anim="phone-left"
        className="phone-container sm:-rotate-2 hover:rotate-0 transition-transform duration-300 transform-gpu"
      >
        <div className="phone-screen-inner h-[430px]">
          <div>
            {/* Status Bar */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#351027]/20 text-[10px] font-extrabold text-[#351027] font-mono">
              <span>9:41</span>
              <span className="text-[#F52F4F] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI RX SCANNER
              </span>
            </div>

            {/* Writer Calibration Profile */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-sm text-[#351027]">Writer Calibration</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#E0F5EE] text-emerald-800 border border-[#351027]">
                  98.4% Match
                </span>
              </div>

              {/* Doctor Selector Chips */}
              <div className="grid grid-cols-2 gap-1 mt-2 p-1 bg-white border border-[#351027] rounded-full text-center text-[9px] font-extrabold text-[#351027]">
                {['Dr. A. Sharma', 'Dr. S. Verma'].map((doc) => (
                  <button
                    key={doc}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`py-1 rounded-full transition-colors truncate px-1.5 ${selectedDoctor === doc ? 'bg-[#FFE8ED] text-[#F52F4F]' : 'hover:bg-slate-50'}`}
                  >
                    {doc}
                  </button>
                ))}
              </div>
            </div>

            {/* Scanned Handwriting OCR Preview Card */}
            <div className="mt-3 p-3 rounded-2xl bg-[#FFE8ED] border-2 border-[#351027] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#F52F4F] flex items-center justify-center text-white text-[9px]">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#351027]">Prescription OCR</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded-md border border-[#351027]">
                  Verified
                </span>
              </div>

              {/* Hand-drawn simulated bounding box */}
              <div className="p-2 rounded-xl bg-white border border-dashed border-[#F52F4F] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#351027]">
                  <span className="font-mono text-[#F52F4F] font-extrabold">Rx: Amoxicillin</span>
                  <span className="text-[9px] text-[#351027]/60">500 mg · Tab</span>
                </div>
                <div className="text-[9px] text-[#351027]/70 font-medium">
                  Sig: 1-0-1 · 5 days after meals
                </div>
              </div>

              {/* Confidence Meter Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-[9px] font-extrabold text-[#351027]/70 mb-1">
                  <span>Confidence Score</span>
                  <span className="text-[#F52F4F]">98.2%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full border border-[#351027] overflow-hidden p-[1px]">
                  <div className="h-full bg-[#F52F4F] rounded-full w-[98%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-center font-bold text-[#351027]/70 pt-2 border-t border-[#351027]/10 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>0 Ambiguities Detected</span>
          </div>
        </div>
      </div>

      {/* ─── Center Phone: Intelligent Connected Care & Safety ─────────── */}
      <div
        data-anim="phone-center"
        className="phone-container z-10 sm:scale-105 sm:-translate-y-4 hover:scale-110 transition-transform duration-300 shadow-tactile-xl transform-gpu"
      >
        <div className="phone-screen-inner h-[465px]">
          <div>
            {/* Top Island Header */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#351027]/20 text-[10px] font-extrabold text-[#351027] font-mono">
              <span>9:41</span>
              <div className="w-16 h-3.5 bg-[#351027] rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#97D8C4] rounded-full animate-pulse" />
              </div>
              <span className="text-emerald-800 font-bold">100% SYNC</span>
            </div>

            {/* Verification Stats */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-left">
                <div className="font-display font-extrabold text-base sm:text-lg text-[#351027]">99.4%</div>
                <div className="text-[8px] uppercase font-bold text-[#351027]/60">Accuracy</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F52F4F] border border-[#351027] flex items-center justify-center text-white shadow-tactile-sm">
                <MedicinePillMascot size={24} mood="happy" />
              </div>
              <div className="text-right">
                <div className="font-display font-extrabold text-base sm:text-lg text-[#351027]">0 Risks</div>
                <div className="text-[8px] uppercase font-bold text-[#351027]/60">Contraindications</div>
              </div>
            </div>

            {/* 4-Arc Concentric Formulary Safety Gauge */}
            <div className="py-2 text-center">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#351027]/70 mb-0.5">
                Safety & Formulary Match
              </div>
              <div className="relative w-44 h-24 mx-auto flex items-center justify-center">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  {/* Arc 1 Gold: Formulary */}
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#FECB66" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="155" cy="38" r="6" fill="#351027" />
                  <circle cx="155" cy="38" r="2.5" fill="#FECB66" />
                  {/* Arc 2 Mint: Interaction Safety */}
                  <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#97D8C4" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="130" cy="50" r="5.5" fill="#351027" />
                  {/* Arc 3 Pink: OCR Confidence */}
                  <path d="M 60 100 A 40 40 0 0 1 140 100" fill="none" stroke="#FF6F89" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="115" cy="65" r="4.5" fill="#351027" />
                  {/* Arc 4 Purple: Auto Refill */}
                  <path d="M 80 100 A 20 20 0 0 1 120 100" fill="none" stroke="#D8B4E2" strokeWidth="12" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Connected Workflow Stepper */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-extrabold uppercase text-[#351027]/60">Connected Dispatch Flow</div>
            
            <div className="p-2 rounded-xl bg-white border border-[#351027] flex items-center justify-between text-[11px] font-bold text-[#351027] shadow-tactile-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Doctor Digitisation</span>
              </div>
              <span className="text-[9px] font-extrabold text-emerald-800">Complete</span>
            </div>

            <div className="p-2 rounded-xl bg-[#FFE8ED] border border-[#351027] flex items-center justify-between text-[11px] font-bold text-[#351027] shadow-tactile-sm">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#F52F4F]" />
                <span>Pharmacy Formulary SKU</span>
              </div>
              <span className="text-[9px] font-extrabold text-[#F52F4F]">Dispatched →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Phone: Patient Dosage Timeline & Refill Prediction ───── */}
      <div
        data-anim="phone-right"
        className="phone-container sm:rotate-2 hover:rotate-0 transition-transform duration-300 transform-gpu"
      >
        <div className="phone-screen-inner h-[430px]">
          <div>
            {/* Status Bar */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#351027]/20 text-[10px] font-extrabold text-[#351027] font-mono">
              <span>9:41</span>
              <span className="text-[#351027] font-bold">DOSAGE TRACKER</span>
            </div>

            {/* Daily Schedule */}
            <div className="mt-3">
              <div className="font-display font-extrabold text-sm text-[#351027]">Today's Regimen</div>
              <div className="text-[9px] text-[#351027]/60">3 Doses Scheduled</div>
            </div>

            {/* Dosage Timeline Cards */}
            <div className="space-y-1.5 mt-2.5">
              <div className="p-2 rounded-xl bg-[#E0F5EE] border border-[#351027] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-800" />
                  <div>
                    <div className="text-[10px] font-extrabold text-emerald-950">8:00 AM (Morning)</div>
                    <div className="text-[8px] text-emerald-800/80">Amoxicillin 500mg</div>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-800">✓ Taken</span>
              </div>

              <div className="p-2 rounded-xl bg-[#FFF0C8] border border-[#351027] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#D97706]" />
                  <div>
                    <div className="text-[10px] font-extrabold text-[#351027]">2:00 PM (Afternoon)</div>
                    <div className="text-[8px] text-[#351027]/70">Paracetamol 650mg</div>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold text-[#D97706]">● Next</span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-[#351027] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#351027]/60" />
                  <div>
                    <div className="text-[10px] font-extrabold text-[#351027]">8:00 PM (Night)</div>
                    <div className="text-[8px] text-[#351027]/70">Amoxicillin 500mg</div>
                  </div>
                </div>
                <span className="text-[9px] text-[#351027]/60">Scheduled</span>
              </div>
            </div>

            {/* Auto-Refill Card */}
            <div className="mt-2.5 p-2 rounded-xl bg-[#F3E8FC] border border-[#351027] flex items-center justify-between text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <Pill className="w-3 h-3 text-[#9333EA]" />
                <span>Auto-Refill in 4 Days</span>
              </div>
              <span className="text-[9px] text-[#9333EA] font-extrabold">Active</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white border border-[#351027] text-center text-[10px] font-extrabold text-[#351027] shadow-tactile-sm">
            Pharmacon Patient Sync Active
          </div>
        </div>
      </div>
    </div>
  );
}
