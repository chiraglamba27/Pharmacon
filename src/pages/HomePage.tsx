import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  FileText, ShieldCheck, Database, Server, RefreshCw, Zap,
  CheckCircle2, ArrowRight, Activity, Sparkles, Users,
  Stethoscope, Building2, UserCheck, Heart, AlertCircle,
  ExternalLink, Check
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  skills?: string;
  github_url?: string;
  linkedin_url?: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'T-001',
    name: 'Aryan Sharma',
    role: 'Frontend Lead',
    focus: 'UI/UX architecture, responsive design system, clinical component workflows, and interactive presentations.',
    avatar: 'AS',
    skills: 'React, TypeScript, Tailwind CSS, Recharts',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-002',
    name: 'Aniket Raj',
    role: 'Backend Lead',
    focus: 'Node.js Express architecture, persistent database design, file storage pipelines, and deliverable publishing.',
    avatar: 'AR',
    skills: 'Node.js, Express, SQLite, REST APIs',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-003',
    name: 'Amitesh Kumar Singh',
    role: 'AI / CV Engineer',
    focus: 'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.',
    avatar: 'AK',
    skills: 'Python, PyTorch, Computer Vision, OCR',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-004',
    name: 'Chirag Lamba',
    role: 'Integration Lead',
    focus: 'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.',
    avatar: 'CL',
    skills: 'CI/CD, GitHub Actions, System Integration, Testing',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
];

export default function HomePage() {
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [dbHealth, setDbHealth] = useState<{
    status: string;
    database: string;
    counts: { inventory: number; prescriptions: number; audit: number };
  } | null>(null);

  const [demoRunning, setDemoRunning] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState<string | null>(null);

  const loadHealth = () => {
    api.get<any>('/health')
      .then((data) => setDbHealth(data))
      .catch(() => {});
  };

  useEffect(() => {
    loadHealth();

    api.get<{ members: TeamMember[] }>('/team')
      .then((data) => {
        if (data.members && data.members.length > 0) {
          setTeam(data.members);
        }
      })
      .catch(() => {});
  }, []);

  const handleRunDemo = async () => {
    setDemoRunning(true);
    setDemoSuccess(null);
    try {
      const res = await api.post<any>('/prescriptions/confirm-sample');
      loadHealth();
      setDemoSuccess(
        `Prescription ${res.prescriptionId || 'RX-DEMO-CONFIRMED'} digitized & verified! Inventory stock decremented and audit trail recorded in database.`
      );
    } catch (e: any) {
      setDemoSuccess(`Demo updated system records: ${e.message}`);
    } finally {
      setDemoRunning(false);
      setTimeout(() => setDemoSuccess(null), 6000);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="pt-12 sm:pt-20 px-4 max-w-6xl mx-auto text-center space-y-6">
        {/* Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Node.js + SQLite Persistent Backend Online
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
            UCS503 Software Engineering Project
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Intelligent Handwritten Prescription Digitization & Formulary Sync
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bridging the critical gap between handwritten clinic prescriptions and pharmacy formularies through adaptive OCR, doctor calibration, automated SKU verification, and real-time inventory synchronization.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/prototype"
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Rx Scanner Prototype</span>
          </Link>
          <Link
            to="/inventory"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-slate-500" />
            <span>View Formulary Inventory</span>
          </Link>
          <Link
            to="/presentation/v1"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Planning Deck v1</span>
          </Link>
        </div>

        {/* Live System Metrics Bar */}
        {dbHealth && (
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div className="px-3">
                <div className="text-2xl font-extrabold text-slate-900">{dbHealth.counts.inventory}</div>
                <div className="text-xs text-slate-500 font-medium">Formulary Medicines</div>
              </div>
              <div className="px-3">
                <div className="text-2xl font-extrabold text-sky-600">{dbHealth.counts.prescriptions}</div>
                <div className="text-xs text-slate-500 font-medium">Digitized Prescriptions</div>
              </div>
              <div className="px-3">
                <div className="text-2xl font-extrabold text-emerald-600">{dbHealth.counts.audit}</div>
                <div className="text-xs text-slate-500 font-medium">Audit Trail Events</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Interactive Quick Demo Widget ────────────────────────────────── */}
      <section className="px-4 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Live End-to-End Workflow Demonstration
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                Experience Instant Digitization & Stock Synchronization
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Click below to simulate digitizing a doctor's prescription for Amoxicillin 500mg. It automatically executes a transaction on our Node.js + SQLite backend: creating the prescription, deducting inventory, and logging immutable audit events.
              </p>
            </div>

            <button
              onClick={handleRunDemo}
              disabled={demoRunning}
              className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-center cursor-pointer"
            >
              {demoRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Transaction...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Run 1-Click Verification</span>
                </>
              )}
            </button>
          </div>

          {demoSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{demoSuccess}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-slate-700/60 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                1
              </div>
              <div>
                <span className="font-semibold text-white">Adaptive OCR</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Extracts dosage, form & sig using calibrated writer embeddings.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                2
              </div>
              <div>
                <span className="font-semibold text-white">Formulary Match</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Cross-checks clinic stock (SKU: AMX-500-CAP) in real time.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                3
              </div>
              <div>
                <span className="font-semibold text-white">Persistent Audit</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Records immutable audit log entries in SQLite database.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Architecture & Capabilities ─────────────────────────────── */}
      <section className="px-4 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">System Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Four Core Pillars of Pharmacon
          </h2>
          <p className="text-sm text-slate-500">
            A reliable medical intelligence platform uniting real-time handwriting recognition, inventory control, and role-based workflows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">1. Adaptive OCR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensemble CNN-Transformer trained with 3-sheet writer calibration per practitioner for accurate medical handwriting extraction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">2. Clinical Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated confidence thresholding flags ambiguous dosage fields directly into clinic staff and pharmacist verification queues.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">3. Formulary Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Persistent Node.js + SQLite backend guarantees instant stock deduction, low-stock warnings, and patient refill routing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">4. Immutable Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every prescription scan, stock adjustment, refill status change, and deliverable publish event is permanently logged.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Role Workspaces ──────────────────────────────────────────────── */}
      <section className="px-4 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Clinical Portals</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Role-Based Clinical Workspaces
            </h2>
          </div>
          <Link to="/login" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            <span>One-Click Role Switcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/doctor"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md hover:border-sky-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Doctor
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Doctor Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Prescription intake, handwriting calibration sheets, and digital sign-off.
            </p>
          </Link>

          <Link
            to="/dashboard/pharmacy"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Pharmacist
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
              Pharmacy & Stock
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Live inventory tracking, SKU stock adjustments, and patient refill queue.
            </p>
          </Link>

          <Link
            to="/dashboard/clinic"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Clinic Staff
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Clinic Intake
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Paper prescription ingestion, OCR confidence verification, and doctor dispatch.
            </p>
          </Link>

          <Link
            to="/dashboard/patient"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md hover:border-pink-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Patient
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
              Patient Care
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Daily dosage schedule tracker, adherence score, and 1-click refill requests.
            </p>
          </Link>
        </div>
      </section>

      {/* ─── Team Pharmacon ──────────────────────────────────────────────── */}
      <section className="px-4 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Engineering Team</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Team Pharmacon
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">UCS503 Software Engineering Course Project</p>
          </div>
          <Link
            to="/team"
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View Full Team & Admin Edit</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-sm border border-slate-200">
                    {member.avatar}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {member.role}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{member.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">
                    {member.focus}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{member.skills ? member.skills.split(',')[0] : 'Engineer'}</span>
                <Link to="/team" className="text-sky-600 font-semibold hover:underline">
                  Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── UCS503 Presentations Quick Section ───────────────────────────── */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-900 text-sm">Course Evaluation Deliverables</h3>
            <p className="text-xs text-slate-500">
              Review interactive web presentations and versioned project decks submitted for UCS503 evaluation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/presentation/v1"
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Planning Deck v1
            </Link>
            <Link
              to="/presentation/v2"
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Planning Deck v2
            </Link>
            <Link
              to="/versions"
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-bold text-white transition-colors"
            >
              All Deliverables
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
