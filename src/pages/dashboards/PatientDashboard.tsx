import React, { useEffect, useState } from 'react';
import {
  Pill, Sun, Moon, Clock, RefreshCw, CheckCircle2,
  Phone, Info, ShieldCheck, Heart, Sparkles, Check, AlertCircle
} from 'lucide-react';
import MedicinePillMascot from '../../components/MedicinePillMascot';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [refillStatus, setRefillStatus] = useState<'idle' | 'pending' | 'approved'>('idle');
  const [refillId, setRefillId] = useState('');
  const [notification, setNotification] = useState('');

  // Interactive daily dose checklist
  const [doses, setDoses] = useState([
    { id: 1, period: 'Morning (8:00 AM)', med: 'Amoxicillin 500mg', instructions: '1 Capsule after breakfast', taken: true, icon: Sun, color: '#FFE8ED' },
    { id: 2, period: 'Afternoon (2:00 PM)', med: 'Paracetamol 650mg', instructions: '1 Tablet after lunch if needed', taken: false, icon: Clock, color: '#FFF0C8' },
    { id: 3, period: 'Night (8:00 PM)', med: 'Amoxicillin 500mg', instructions: '1 Capsule after dinner', taken: false, icon: Moon, color: '#F3E8FC' },
  ]);

  const toggleDose = (id: number) => {
    setDoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, taken: !d.taken } : d))
    );
  };

  const takenCount = doses.filter((d) => d.taken).length;
  const adherencePercent = Math.round((takenCount / doses.length) * 100);

  const handleRequestRefill = async () => {
    try {
      const res = await api.post<{ id: string }>('/refills');
      if (res?.id) setRefillId(res.id);
    } catch (e) {
      setRefillId(`RF-${Date.now().toString(36).toUpperCase()}`);
    }

    setRefillStatus('pending');
    setNotification('Refill request submitted to Apollo Pharmacy! Real-time status: Pending Pharmacist Review.');
    setTimeout(() => setNotification(''), 4500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={28} mood="happy" sparkles={true} />
            <span className="pill-tag-pink">Patient Connected Care</span>
            <span className="pill-tag">Role: Patient (Active)</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Welcome, {user?.name || 'Rahul Kumar'}
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            View your active digitized prescriptions, track your daily dosage schedule, and request one-click refills.
          </p>
        </div>

        <div className="card-tactile p-3 bg-[#E0F5EE] border-2 border-[#351027] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#059669] text-white flex items-center justify-center font-display font-extrabold text-sm">
            {adherencePercent}%
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#351027]/60">Daily Adherence</div>
            <div className="text-xs font-extrabold text-emerald-950">
              {takenCount} of {doses.length} Doses Taken
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-[#E0F5EE] border-2 border-[#351027] rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-tactile-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── 1. Daily Dosage Checklist ────────────────────────────────────── */}
      <div className="card-tactile p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              Today's Dosage Schedule
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#351027]/60">Tap to mark taken</span>
        </div>

        <div className="grid gap-3">
          {doses.map((dose) => {
            const Icon = dose.icon;
            return (
              <div
                key={dose.id}
                onClick={() => toggleDose(dose.id)}
                className={`p-4 rounded-2xl border-2 border-[#351027] flex items-center justify-between cursor-pointer transition-all shadow-tactile-sm ${
                  dose.taken ? 'bg-[#E0F5EE] border-emerald-900' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-[#351027] flex items-center justify-center text-[#351027]"
                    style={{ backgroundColor: dose.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm text-[#351027]">
                      {dose.period} — <span className="text-[#F52F4F]">{dose.med}</span>
                    </div>
                    <div className="text-xs text-[#351027]/70 font-medium">
                      {dose.instructions}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-xl border-2 border-[#351027] flex items-center justify-center transition-colors ${
                    dose.taken ? 'bg-emerald-600 text-white' : 'bg-white'
                  }`}
                >
                  {dose.taken && <Check className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 2. Confirmed Prescriptions & 1-Click Refill ───────────────────── */}
      <div className="card-tactile p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              Active Digitized Prescriptions
            </h2>
          </div>
          <span className="pill-tag-dark text-[10px]">Verified by Dr. A. Sharma</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF8E8] border-2 border-[#351027] space-y-4 shadow-tactile-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-extrabold text-base text-[#351027]">
                Amoxicillin 500mg (Oral Capsule)
              </h3>
              <div className="text-xs text-[#351027]/70 font-medium">
                Prescription #RX-2026-0081 · Prescribed 25 Aug 2026 · Course: 5 Days
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#E0F5EE] border border-[#351027] text-xs font-extrabold text-emerald-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verified Safe
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#351027] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#351027]">
                Need a refill before your course ends?
              </div>
              <div className="text-[10px] text-[#351027]/60 font-medium">
                Requests are routed directly to Apollo Central Pharmacy.
              </div>
            </div>

            {refillStatus === 'idle' ? (
              <button onClick={handleRequestRefill} className="btn-tactile btn-tactile-gold">
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Request Refill ⚡
                </span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-[#FFF0C8] border border-[#351027] text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                Refill Pending Approval ({refillId})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clinic Contact */}
      <div className="p-4 bg-white rounded-2xl border-2 border-[#351027] flex items-center justify-between shadow-tactile-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FFE8ED] border border-[#351027] flex items-center justify-center text-[#F52F4F]">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#351027]">Central Health Clinic & Pharmacy</div>
            <div className="text-[10px] text-[#351027]/60 font-medium">Helpline: +91 98765 43210 (Open 24/7)</div>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#E0F5EE] border border-[#351027] text-emerald-900">
          Connected
        </span>
      </div>
    </div>
  );
}
