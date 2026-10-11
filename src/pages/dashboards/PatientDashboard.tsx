import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill, Sun, Moon, Clock, RefreshCw, CheckCircle2,
  Phone, ShieldCheck, Heart, Sparkles, Check, AlertCircle, Calendar, ArrowRight
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface PrescriptionRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  status: string;
  created_at: string;
  fields: { id: number; label: string; value: string; confidence: number; needs_verification: number }[];
}

interface RefillRecord {
  id: string;
  prescription_id?: string;
  patient_name: string;
  medicine: string;
  strength: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  requestDate: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [refills, setRefills] = useState<RefillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [loopCompleted, setLoopCompleted] = useState(false);

  // Daily dose checklist state
  const [doses, setDoses] = useState([
    { id: 1, period: 'Morning (8:00 AM)', med: 'Amoxicillin 500mg', instructions: '1 Capsule after breakfast', taken: true, icon: Sun },
    { id: 2, period: 'Afternoon (2:00 PM)', med: 'Paracetamol 650mg', instructions: '1 Tablet after lunch if needed', taken: false, icon: Clock },
    { id: 3, period: 'Night (8:00 PM)', med: 'Amoxicillin 500mg', instructions: '1 Capsule after dinner', taken: false, icon: Moon },
  ]);

  const toggleDose = (id: number) => {
    setDoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, taken: !d.taken } : d))
    );
  };

  const takenCount = doses.filter((d) => d.taken).length;
  const adherencePercent = Math.round((takenCount / doses.length) * 100);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rxRes, refRes] = await Promise.all([
        api.get<{ prescriptions: PrescriptionRecord[] }>('/prescriptions'),
        api.get<{ refills: RefillRecord[] }>('/refills'),
      ]);

      if (rxRes?.prescriptions) {
        const active = rxRes.prescriptions.filter(
          (p) => p.status === 'dispensed' || p.status === 'confirmed' || p.status === 'verified'
        );
        setPrescriptions(active.length > 0 ? active : rxRes.prescriptions);
      }

      if (refRes?.refills) {
        setRefills(refRes.refills);
      }
    } catch (err) {
      console.error('Failed to load patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestRefill = async (rx: PrescriptionRecord) => {
    const medField = rx.fields?.find((f) => f.label.toLowerCase().includes('med'))?.value || 'Amoxicillin';
    const strengthField = rx.fields?.find((f) => f.label.toLowerCase().includes('strength'))?.value || '500 mg';

    setRequestingId(rx.id);
    try {
      const res = await api.post<{ id: string }>('/refills', {
        prescriptionId: rx.id,
        medicine: medField,
        strength: strengthField,
      });

      setNotification(`Refill request (${res.id}) submitted to Apollo Pharmacy! Status is now Pending Pharmacist Review.`);
      setLoopCompleted(true);
      loadData();
      setTimeout(() => setNotification(''), 4500);
    } catch (err: any) {
      alert('Failed to request refill: ' + (err.message || 'Server error'));
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="page-container max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-pink">Patient Connected Care</span>
            <span className="badge-slate">Logged in as: {user?.name || 'Rahul Kumar'}</span>
            <span className="badge-teal">Active Prescriptions: {prescriptions.length}</span>
          </div>
          <h1 className="page-title">My Prescriptions & Adherence Tracker</h1>
          <p className="page-subtitle">
            View clear digital medications transcribed from handwritten prescriptions, track your daily schedule, and request one-click refills.
          </p>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-emerald-50/60 border-emerald-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {adherencePercent}%
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">Today's Adherence</div>
            <div className="text-sm font-bold text-slate-900">
              {takenCount} of {doses.length} Doses Logged
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Lifecycle Complete Banner */}
      {loopCompleted && (
        <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
              🎉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                  Step 4 of 4 Complete • Full Loop Verified
                </span>
              </div>
              <h3 className="font-extrabold text-base text-emerald-950 mt-0.5">
                Complete End-to-End Clinical Lifecycle Executed!
              </h3>
              <p className="text-xs text-emerald-900/80 font-medium">
                1. Scanned via OCR ➔ 2. Approved by Doctor ➔ 3. Dispensed by Pharmacy ➔ 4. Received by Patient & Refill Triggered. All actions logged in SQLite!
              </p>
            </div>
          </div>

          <Link
            to="/audit"
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>View Real-Time Audit Log</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-900 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── 1. Daily Dosage Checklist ────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Today's Medication & Dosage Schedule
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Click a dose to mark as taken</span>
        </div>

        <div className="grid gap-3">
          {doses.map((dose) => {
            const Icon = dose.icon;
            return (
              <div
                key={dose.id}
                onClick={() => toggleDose(dose.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  dose.taken
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      dose.taken ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {dose.period} — <span className="text-cyan-700">{dose.med}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {dose.instructions}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                    dose.taken ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {dose.taken && <Check className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 2. Active Digitized Prescriptions from SQLite ──────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Active Digitized Prescriptions
            </h2>
          </div>
          <span className="badge-blue">{prescriptions.length} Active Records</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-600" />
            Loading prescriptions from SQLite database...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl">
            No prescriptions found for your profile.
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.slice(0, 3).map((rx) => {
              const med = rx.fields?.find((f) => f.label.toLowerCase().includes('med'))?.value || 'Amoxicillin';
              const strength = rx.fields?.find((f) => f.label.toLowerCase().includes('strength'))?.value || '500 mg';
              const form = rx.fields?.find((f) => f.label.toLowerCase().includes('form'))?.value || 'Tablet';
              const duration = rx.fields?.find((f) => f.label.toLowerCase().includes('duration'))?.value || '5 days';

              // Check if refill is pending for this rx
              const existingRefill = refills.find((r) => r.prescription_id === rx.id || r.medicine.toLowerCase() === med.toLowerCase());

              return (
                <div
                  key={rx.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          {med} {strength} ({form})
                        </h3>
                        <span className="badge-green text-xs">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Prescription #{rx.id} · Prescribed by {rx.doctor_name} · Course: {duration}
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      {rx.created_at ? new Date(rx.created_at).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {rx.fields?.slice(0, 5).map((f, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                        <strong>{f.label}:</strong> {f.value}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Need a refill for this medication?
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Your request is sent directly to Chief Pharmacist Vikram Singh at Apollo Pharmacy.
                      </div>
                    </div>

                    {existingRefill ? (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        existingRefill.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Refill {existingRefill.status.toUpperCase()} ({existingRefill.id})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequestRefill(rx)}
                        disabled={requestingId === rx.id}
                        className="btn-primary text-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${requestingId === rx.id ? 'animate-spin' : ''}`} />
                        Request Refill ⚡
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clinic Contact */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Connected Care Helpline & Pharmacy Desk</div>
            <div className="text-xs text-slate-500">Helpline: +91 98765 43210 (Apollo Central Hub · Open 24/7)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
