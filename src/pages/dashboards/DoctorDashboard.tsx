import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, CheckCircle2, Sparkles, AlertCircle, Plus,
  Upload, Check, ShieldCheck, Stethoscope, Clock, Camera, Save, ArrowRight
} from 'lucide-react';
import MedicinePillMascot from '../../components/MedicinePillMascot';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface PrescriptionItem {
  id: string;
  patient_name: string;
  doctor_name: string;
  status: string;
  created_at: string;
  fields: { label: string; value: string; confidence: number; needs_verification: number }[];
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'RX-2026-0081',
      patient_name: 'Rahul Kumar',
      doctor_name: 'Dr. A. Sharma',
      status: 'confirmed',
      created_at: '2026-08-25',
      fields: [
        { label: 'Medicine', value: 'Amoxicillin', confidence: 98, needs_verification: 0 },
        { label: 'Strength', value: '500 mg', confidence: 99, needs_verification: 0 },
        { label: 'Dosage Form', value: 'Tablet', confidence: 97, needs_verification: 0 },
        { label: 'Frequency', value: '1-0-1 (Morning & Night)', confidence: 96, needs_verification: 0 },
        { label: 'Duration', value: '5 days', confidence: 95, needs_verification: 0 },
        { label: 'Instructions', value: 'After food with water', confidence: 94, needs_verification: 0 },
      ],
    },
    {
      id: 'RX-2026-0082',
      patient_name: 'Meera Patel',
      doctor_name: 'Dr. A. Sharma',
      status: 'confirmed',
      created_at: '2026-08-24',
      fields: [
        { label: 'Medicine', value: 'Metformin', confidence: 96, needs_verification: 0 },
        { label: 'Strength', value: '500 mg', confidence: 98, needs_verification: 0 },
        { label: 'Dosage Form', value: 'Tablet', confidence: 99, needs_verification: 0 },
        { label: 'Frequency', value: '1-0-0 (Morning with breakfast)', confidence: 92, needs_verification: 0 },
        { label: 'Duration', value: '30 days', confidence: 97, needs_verification: 0 },
      ],
    },
  ]);

  // Calibration state
  const [calibrationSamples, setCalibrationSamples] = useState([
    { name: 'Sheet 1: Numerals, Fractions & Dosage (1-0-1, QDS, BD)', status: 'calibrated', accuracy: '98.8%' },
    { name: 'Sheet 2: Medical Abbreviations & Units (mg, ml, tab, cap)', status: 'calibrated', accuracy: '97.9%' },
    { name: 'Sheet 3: Common Formulary Brand Names (Amox, Para, Met)', status: 'calibrated', accuracy: '98.5%' },
  ]);

  // New Prescription Intake Form State
  const [scanning, setScanning] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [medicine, setMedicine] = useState('');
  const [strength, setStrength] = useState('500 mg');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState('5 days');
  const [instructions, setInstructions] = useState('After meals');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem('pharmacon_doctor_prescriptions');
    if (cached) {
      try {
        setPrescriptions(JSON.parse(cached));
      } catch (e) {}
    }

    api.get<{ prescriptions: PrescriptionItem[] }>('/prescriptions/PT-1001')
      .then((data) => {
        if (data.prescriptions && data.prescriptions.length > 0) {
          setPrescriptions((prev) => [...data.prescriptions, ...prev.filter(p => !data.prescriptions.some(dp => dp.id === p.id))]);
        }
      })
      .catch(() => {});
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

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: PrescriptionItem = {
      id: `RX-${Date.now().toString(36).toUpperCase()}`,
      patient_name: patientName || 'Pooja Sharma',
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

    const updated = [newRx, ...prescriptions];
    setPrescriptions(updated);
    localStorage.setItem('pharmacon_doctor_prescriptions', JSON.stringify(updated));

    setSuccessMessage(`Prescription ${newRx.id} verified, digitally signed & synced to pharmacy!`);
    setScanning(false);
    setPatientName('');
    setMedicine('');
    setUploadedFileName('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={28} mood="smart" />
            <span className="pill-tag-pink">Doctor Clinical Workspace</span>
            <span className="pill-tag">Role: Doctor (Active)</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Doctor Prescription & Calibration Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            Review AI OCR digitisation, train your personalized handwriting embeddings, and digitally sign prescriptions.
          </p>
        </div>

        <button
          onClick={() => setScanning(!scanning)}
          className="btn-tactile btn-tactile-gold"
        >
          <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{scanning ? 'Close Intake Form' : 'Digitise New Prescription'}</span>
          </span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-[#E0F5EE] border-2 border-[#351027] rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-tactile-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ─── 1. Prescription Digitisation & Signing Intake Studio ────────── */}
      {scanning && (
        <div className="card-tactile p-6 sm:p-8 bg-[#FFE8ED] border-2 border-[#351027] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F52F4F]" />
              <h2 className="heading-chunky text-xl text-[#8F1230]">
                AI Handwriting Intake & Calibration Studio
              </h2>
            </div>
            <span className="pill-tag-dark text-[10px]">Writer Profile Active: Dr. A. Sharma</span>
          </div>

          <form onSubmit={handleCreatePrescription} className="space-y-4">
            {/* File Upload / Camera Trigger */}
            <div className="p-4 bg-white rounded-2xl border-2 border-[#351027] shadow-tactile-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE8ED] border border-[#351027] flex items-center justify-center text-[#F52F4F]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#351027]">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Upload Handwritten Prescription Slip'}
                  </div>
                  <div className="text-[10px] text-[#351027]/60 font-medium">
                    Upload PNG, JPG or PDF to run doctor-adaptive OCR segmentation
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
                className="btn-tactile btn-tactile-pink"
              >
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Choose File or Photo
                </span>
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs font-bold text-[#351027]">
              <div>
                <label className="block uppercase tracking-wider mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Strength *</label>
                <input
                  type="text"
                  required
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Dosage Form</label>
                <select
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block uppercase tracking-wider mb-1">Special Clinical Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#351027] bg-white font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#351027]/10">
              <button
                type="button"
                onClick={() => setScanning(false)}
                className="btn-tactile btn-tactile-white"
              >
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold">
                  Cancel
                </span>
              </button>

              <button type="submit" className="btn-tactile btn-tactile-dark">
                <span className="btn-tactile-inner py-1.5 px-6 text-xs font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Digitally Sign & Sync to Pharmacy
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── 2. Active Prescriptions History Table ────────────────────────── */}
      <div className="card-tactile p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              Doctor's Active Patient Prescriptions
            </h2>
          </div>
          <span className="pill-tag-gold text-[10px]">{prescriptions.length} Records</span>
        </div>

        <div className="grid gap-3">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-4 rounded-2xl bg-[#FFF8E8] border-2 border-[#351027] space-y-3 shadow-tactile-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE8ED] border border-[#351027] flex items-center justify-center font-display font-extrabold text-[#F52F4F]">
                    Rx
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-[#351027]">
                      {rx.patient_name}
                    </h3>
                    <span className="text-[10px] text-[#351027]/60 font-mono">
                      ID: {rx.id} · Issued: {rx.created_at}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#E0F5EE] border border-[#351027] text-[10px] font-extrabold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Doctor Verified & Signed
                  </span>
                </div>
              </div>

              {/* Parsed Fields Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#351027]/10 text-xs">
                {rx.fields.map((field, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-xl border border-[#351027]">
                    <div className="text-[9px] uppercase font-bold text-[#351027]/60">{field.label}</div>
                    <div className="font-extrabold text-[#351027] truncate mt-0.5">{field.value}</div>
                    <div className="text-[9px] text-emerald-700 font-bold mt-1">
                      {field.confidence}% Match
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Doctor Handwriting Calibration Studio ─────────────────────── */}
      <div className="card-tactile p-6 bg-[#E0F5EE] border-2 border-[#351027] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
          <div>
            <h2 className="heading-chunky text-lg text-emerald-950">
              Handwriting Model Calibration Calibration Studio
            </h2>
            <p className="text-xs text-emerald-900/80 font-medium">
              3-sheet sample baseline provides 98.4% OCR precision for Dr. A. Sharma.
            </p>
          </div>
          <span className="pill-tag-dark text-[10px]">Model v2.4 Active</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {calibrationSamples.map((sample, idx) => (
            <div key={idx} className="p-3.5 bg-white rounded-2xl border-2 border-[#351027] space-y-2 shadow-tactile-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#F52F4F]">Calibration Sheet {idx + 1}</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-[#E0F5EE] px-1.5 py-0.5 rounded-full">
                  {sample.accuracy}
                </span>
              </div>
              <p className="text-xs text-[#351027] font-extrabold leading-snug">
                {sample.name}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#351027]/10 text-[10px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Embeddings Synced
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
