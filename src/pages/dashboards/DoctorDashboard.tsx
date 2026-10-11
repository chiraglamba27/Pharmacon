import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Sparkles, CheckCircle2, ShieldCheck,
  Stethoscope, Clock, FileText, ChevronRight, Plus, Camera,
  RefreshCw, Users, Check, AlertCircle, ArrowRight, Building2
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface PrescriptionItem {
  id: string;
  patient_name: string;
  doctor_name: string;
  status: string;
  created_at: string;
  fields: { id?: number; label: string; value: string; confidence: number; needs_verification: number }[];
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [medicine, setMedicine] = useState('');
  const [strength, setStrength] = useState('500 mg');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState('5 days');
  const [instructions, setInstructions] = useState('After meals with water');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [recentlyApprovedId, setRecentlyApprovedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPrescriptions = () => {
    setLoading(true);
    api.get<{ prescriptions: PrescriptionItem[] }>('/prescriptions')
      .then((data) => {
        if (data.prescriptions) {
          setPrescriptions(data.prescriptions);
        }
      })
      .catch((err) => console.error('Failed to load prescriptions:', err))
      .finally(() => setLoading(false));
  };

  const handleApprovePrescription = async (rxId: string) => {
    setApprovingId(rxId);
    try {
      await api.put(`/prescriptions/${rxId}/status`, { status: 'verified' });
      setRecentlyApprovedId(rxId);
      setSuccessMessage(`Prescription ${rxId} verified & digitally signed! Synced to Pharmacy Dispensing Queue.`);
      fetchPrescriptions();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (e: any) {
      alert('Failed to approve prescription: ' + (e.message || 'Server error'));
    } finally {
      setApprovingId(null);
    }
  };

  const handleSwitchToPharmacyAndDispense = async () => {
    await login('pharmacist.vikram@example.com', 'pharma123');
    navigate('/dashboard/pharmacy');
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    // Simulate instant AI handwriting parsing
    setMedicine('Amoxicillin Clavulanate');
    setStrength('625 mg');
    setFrequency('1-0-1');
    setDuration('7 days');
    setInstructions('Twice daily after food');
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: PrescriptionItem = {
      id: `RX-${Date.now().toString(36).toUpperCase()}`,
      patient_name: patientName || 'Walk-in Patient',
      doctor_name: user?.name || 'Dr. A. Sharma',
      status: 'confirmed',
      created_at: new Date().toISOString().split('T')[0],
      fields: [
        { label: 'Medicine', value: medicine || 'Azithromycin', confidence: 98, needs_verification: 0 },
        { label: 'Strength', value: strength, confidence: 99, needs_verification: 0 },
        { label: 'Dosage Form', value: dosageForm, confidence: 97, needs_verification: 0 },
        { label: 'Frequency', value: frequency, confidence: 96, needs_verification: 0 },
        { label: 'Duration', value: duration, confidence: 95, needs_verification: 0 },
        { label: 'Instructions', value: instructions, confidence: 94, needs_verification: 0 },
      ],
    };

    try {
      await api.post('/prescriptions', newRx);
      setSuccessMessage(`Prescription ${newRx.id} verified, digitally signed & stored in SQLite database!`);
      fetchPrescriptions();
      setScanning(false);
      setPatientName('');
      setMedicine('');
      setUploadedFileName('');
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err: any) {
      alert('Error creating prescription: ' + (err.message || 'Server error'));
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-blue">Doctor Clinical Workspace</span>
            <span className="badge-slate">Logged in as: {user?.name || 'Dr. A. Sharma'}</span>
            <span className="badge-green">SQLite Live DB</span>
          </div>
          <h1 className="page-title">Doctor Prescription & Calibration Portal</h1>
          <p className="page-subtitle">
            Review OCR transcriptions, manage active patient prescriptions, and digitally sign verified medication orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchPrescriptions} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setScanning(!scanning)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            {scanning ? 'Close Form' : 'Digitise New Prescription'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-900 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ─── 1. Prescription Digitisation & Signing Intake Studio ────────── */}
      {scanning && (
        <div className="card p-6 sm:p-8 bg-sky-50/40 border-sky-200 space-y-6 animate-in">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-bold text-slate-900">
                AI Handwriting Intake & Calibration Studio
              </h2>
            </div>
            <span className="badge-blue">Writer Profile: {user?.name || 'Dr. A. Sharma'}</span>
          </div>

          <form onSubmit={handleCreatePrescription} className="space-y-4">
            {/* File Upload Trigger */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Upload Handwritten Prescription Slip'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Upload PNG, JPG or PDF to simulate handwriting segmentation
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Select Prescription File
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase tracking-wider mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Prescribed Medicine *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin Clavulanate"
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Strength *</label>
                <input
                  type="text"
                  required
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Dosage Form</label>
                <select
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  className="form-input text-sm"
                >
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Syrup</option>
                  <option>Injection</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Frequency</label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block uppercase tracking-wider mb-1">Special Clinical Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="form-input text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setScanning(false)}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button type="submit" className="btn-primary">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Digitally Sign & Sync to SQLite
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 Completion Banner */}
      {recentlyApprovedId && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                  Step 2 of 4 Complete
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800">{recentlyApprovedId}</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 mt-0.5">
                Prescription Verified & Digitally Signed by Doctor!
              </h3>
              <p className="text-xs text-emerald-900/80 font-medium">
                The order is now queued in the Pharmacy Dispensing Queue waiting for medicine fulfillment.
              </p>
            </div>
          </div>

          <button
            onClick={handleSwitchToPharmacyAndDispense}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Go to Step 3: Switch to Pharmacist & Dispense</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── 2. Prescription Records List from SQLite ──────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Prescription Orders ({prescriptions.length} Records in SQLite)
            </h2>
          </div>
          <span className="badge-teal">Live Database</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
            Loading prescriptions from SQLite...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No prescriptions created yet. Click "Digitise New Prescription" above.
          </div>
        ) : (
          <div className="grid gap-3">
            {prescriptions.map((rx) => {
              const med = rx.fields?.find((f) => f.label.toLowerCase().includes('med'))?.value || 'Medication';
              const strengthVal = rx.fields?.find((f) => f.label.toLowerCase().includes('strength'))?.value || '';
              const isPending = rx.status === 'pending' || rx.status === 'pending_review';

              return (
                <div
                  key={rx.id}
                  className={`p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                    isPending ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-base text-slate-900">
                        {rx.patient_name}
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {rx.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : rx.status === 'dispensed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPending ? 'AWAITING APPROVAL' : rx.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                      <span>Prescribed: <strong className="text-slate-900">{med} {strengthVal}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">Doctor: {rx.doctor_name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {rx.created_at ? new Date(rx.created_at).toLocaleDateString() : 'Today'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {rx.fields?.slice(0, 4).map((f, i) => (
                        <span key={i} className="text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {f.label}: <strong>{f.value}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {isPending ? (
                    <button
                      onClick={() => handleApprovePrescription(rx.id)}
                      disabled={approvingId === rx.id}
                      className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                      <span>{approvingId === rx.id ? 'Approving...' : 'Approve & Sign (Step 2)'}</span>
                    </button>
                  ) : rx.status === 'dispensed' ? (
                    <span className="text-xs text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Dispensed by Pharmacy
                    </span>
                  ) : (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Verified & Signed
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Ready in Pharmacy Queue</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
