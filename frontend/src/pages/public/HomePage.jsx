import { Link } from 'react-router-dom';
import { Pill, Upload, Package, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const STATUS_BADGE = {
  label: 'Active Development',
  class: 'badge-yellow',
};

const FEATURES = [
  { icon: Upload, title: 'Prescription Upload', desc: 'Digitise handwritten prescriptions with secure file storage and processing pipeline.' },
  { icon: CheckCircle, title: 'Human Verification', desc: 'Extracted data reviewed and corrected by authorised staff before confirmation.' },
  { icon: Package, title: 'Medicine Inventory', desc: 'Track medicine stock, batches, expiry dates, restocking, and dispensing transactions.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Doctors, pharmacists, clinic staff, and patients each have scoped, secure access.' },
  { icon: Clock, title: 'Audit Trail', desc: 'Every important action is logged — prescription corrections, dispensing, inventory changes.' },
  { icon: Pill, title: 'AI Integration (Pending)', desc: 'Handwriting recognition pipeline designed and ready — model integration in progress.' },
];

const TEAM = [
  { name: 'Aryan Sharma', role: 'Frontend / UI/UX' },
  { name: 'Aniket Raj', role: 'Backend / Storage' },
  { name: 'Amitesh Kumar Singh', role: 'AI / Computer Vision' },
  { name: 'Chirag Lamba', role: 'Integration / QA' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-surface-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            {STATUS_BADGE.label}
          </div>

          <h1 className="text-5xl font-bold text-surface-900 leading-tight mb-4 text-balance">
            Pharmacon
          </h1>
          <p className="text-xl text-surface-600 max-w-2xl mx-auto mb-2">
            Prescription Digitisation &amp; Medication Management
          </p>
          <p className="text-surface-500 max-w-xl mx-auto mb-10 text-sm leading-relaxed">
            A university semester project transforming handwritten prescriptions into structured digital records —
            with a complete pharmacy inventory, role-based workflows, and a future AI recognition pipeline.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/project" className="btn-primary btn-lg no-underline">
              Explore Project <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/presentations" className="btn-secondary btn-lg no-underline">
              View Presentations
            </Link>
            <Link to="/login" className="btn-ghost btn-lg no-underline">
              Login →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Problem / Solution ────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-surface-900 mb-4">The Problem</h2>
            <p className="text-surface-600 leading-relaxed mb-4">
              Handwritten prescriptions remain the norm in many clinics. Manual transcription is
              error-prone, time-consuming, and creates no searchable digital record. Patients lack
              visibility into their medication history, and pharmacies struggle to cross-check inventory.
            </p>
            <p className="text-surface-500 text-sm">
              Errors in prescription transcription contribute to a significant proportion of medication errors globally.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-surface-900 mb-4">The Proposed Solution</h2>
            <p className="text-surface-600 leading-relaxed mb-4">
              Pharmacon digitises prescriptions through a structured pipeline — upload, AI extraction
              (pending integration), human verification, and confirmation. The result is a structured
              digital prescription linked to inventory, accessible to all authorised parties.
            </p>
            <p className="text-surface-500 text-sm">
              The AI model is not yet integrated. The system is built to accept it without rewriting the workflow.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────── */}
      <section className="bg-surface-50 border-y border-surface-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold text-surface-900 mb-2 text-center">Current Capabilities</h2>
          <p className="text-surface-500 text-center text-sm mb-10">What the system supports today</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card card-body">
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-1 text-sm">{title}</h3>
                <p className="text-surface-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-surface-900 mb-2 text-center">The Team</h2>
        <p className="text-surface-500 text-center text-sm mb-10">
          <Link to="/team">View full team page →</Link>
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map(({ name, role }) => (
            <div key={name} className="card card-body text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-700 font-bold text-sm">{name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <p className="font-semibold text-surface-900 text-sm">{name}</p>
              <p className="text-surface-500 text-xs mt-1">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Tech stack ────────────────────────────────────── */}
      <section className="bg-surface-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-semibold mb-2 text-center">Technology Stack</h2>
          <p className="text-surface-400 text-center text-sm mb-10">
            <Link to="/architecture" className="text-brand-400 hover:text-brand-300">View architecture →</Link>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { layer: 'Frontend', tech: 'React + Vite + Tailwind CSS' },
              { layer: 'Backend', tech: 'Node.js + Express' },
              { layer: 'Database', tech: 'Supabase PostgreSQL' },
              { layer: 'Auth / Storage', tech: 'Supabase Auth + Storage' },
            ].map(({ layer, tech }) => (
              <div key={layer}>
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">{layer}</p>
                <p className="text-sm font-medium text-white">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
