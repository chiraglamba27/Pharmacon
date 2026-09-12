import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  FileText, Download, UserCheck, Shield, Server,
  Layers, AlertTriangle, CheckCircle, Activity,
  Users, Sparkles, Cpu, Clock, Calendar, Bookmark, RefreshCw, Smartphone,
  Edit3, X, Save, Upload, Loader2, Check
} from 'lucide-react';
import GanttChart from '../components/GanttChart';
import MedicinePillMascot from '../components/MedicinePillMascot';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function PlanningPresentationV1Page() {
  const { isAuthenticated, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slides' | 'document'>('slides');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editable presentation metadata and copy state
  const [presentationMeta, setPresentationMeta] = useState({
    title: 'Project Planning Presentation v1',
    subtitle: 'Connecting Handwritten Prescriptions to Connected Care',
    version: 'Planning Presentation v1.0.0',
    date: 'August 25, 2026',
    authors: 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
    course: 'Software Engineering Project',
    department: 'Computer Science Department, Thapar Institute of Engineering & Technology (TIET)',
    supervisor: 'Sukhpal Singh (ssingh1_phd23@thapar.edu)',
    downloadUrl: '/presentations/Pharmacon_Commitment_Pitch.pptx',
    fileName: 'Pharmacon_Commitment_Pitch.pptx',
    scopeProblem: 'In clinical settings, doctors write prescriptions by hand. Staff must manually interpret and re-type prescription lines into disconnected pharmacy or billing systems. This causes transcription errors, dispensing delays, and siloed patient records.',
    scopeCoreIdea: 'One photo → one review screen → one verification — instead of full manual re-entry.',
    risksNote: 'Mitigated with doctor-adaptive CNN-Transformers, minimum 3 calibration sheets, and human-in-the-loop review.',
  });

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(presentationMeta);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cached or API stored presentation data on mount
  useEffect(() => {
    const cached = localStorage.getItem('pharmacon_planning_v1_meta');
    if (cached) {
      try {
        setPresentationMeta(JSON.parse(cached));
      } catch (e) {}
    }

    api.get<{ sections: any }>('/content/page/planning-v1')
      .then((data) => {
        if (data.sections?.meta?.[0]) {
          setPresentationMeta((prev) => ({ ...prev, ...data.sections.meta[0] }));
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenEdit = () => {
    setEditDraft(presentationMeta);
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set file name and create local object URL
    const fileUrl = URL.createObjectURL(file);
    setEditDraft((prev) => ({
      ...prev,
      fileName: file.name,
      downloadUrl: fileUrl,
    }));
  };

  const handleSaveDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Save to API
      await api.put('/content/page/planning-v1/meta', { items: [editDraft] });
    } catch (e) {
      // Fallback local persistence
    } finally {
      // 2. Persist to state and localStorage
      setPresentationMeta(editDraft);
      localStorage.setItem('pharmacon_planning_v1_meta', JSON.stringify(editDraft));
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
      }, 700);
    }
  };

  const slides = [
    {
      id: 'title',
      title: 'UCS503 Project Planning Presentation',
      category: 'Overview',
      content: (
        <div className="flex flex-col justify-center items-center text-center py-6 sm:py-10 space-y-6">
          <div className="flex items-center gap-2">
            <MedicinePillMascot size={36} mood="happy" sparkles={true} />
            <span className="pill-tag-dark uppercase tracking-wider text-xs">
              UCS503 Project Deliverable · Planning v1
            </span>
          </div>

          <h1 className="heading-chunky text-3xl sm:text-5xl text-[#351027] tracking-tight max-w-3xl">
            {presentationMeta.subtitle.includes('Pharmacon') ? presentationMeta.subtitle : `Pharmacon: ${presentationMeta.subtitle}`}
          </h1>
          <p className="text-base text-[#351027]/80 max-w-2xl leading-relaxed font-medium">
            A verified prescription digitisation platform featuring doctor-adaptive computer vision, human-in-the-loop review, and automated formulary inventory integration.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 p-3 bg-white border-2 border-[#351027] rounded-2xl text-xs font-bold text-[#351027] shadow-tactile-sm">
            <span>📅 {presentationMeta.date}</span>
            <span>•</span>
            <span className="text-[#F52F4F]">🏷️ {presentationMeta.version}</span>
            <span>•</span>
            <span>👨‍🏫 Supervisor: {presentationMeta.supervisor}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-2">
            {presentationMeta.authors.split(',').map((author, i) => {
              const roles = ['Frontend Lead', 'Backend Lead', 'AI / CV Engineer', 'Integration Lead'];
              return (
                <div key={i} className="p-3 bg-white border-2 border-[#351027] rounded-xl text-center shadow-tactile-sm">
                  <div className="text-xs font-display font-extrabold text-[#351027]">{author.trim()}</div>
                  <div className="text-[11px] text-[#F52F4F] font-bold">{roles[i % roles.length]}</div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'scope',
      title: '1. Project Scope & Objectives',
      category: 'Section 1/8',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-tactile p-6 space-y-3">
              <h3 className="font-display font-extrabold text-base text-[#351027] flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#F52F4F]" />
                The Core Problem
              </h3>
              <p className="text-sm text-[#351027]/80 leading-relaxed font-medium">
                {presentationMeta.scopeProblem}
              </p>
              <div className="mt-2 p-3 bg-[#FFE8ED] rounded-xl text-xs font-bold text-[#8F1230] border border-[#351027]">
                💡 Core Idea: "{presentationMeta.scopeCoreIdea}"
              </div>
            </div>

            <div className="card-tactile p-6 space-y-3">
              <h3 className="font-display font-extrabold text-base text-[#351027] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Key Project Objectives
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#351027]/80 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F52F4F] mt-1.5 flex-shrink-0" />
                  <span><strong>AI-Assisted Digitisation:</strong> Extract medicine, strength, dosage form, and timing from paper photos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F52F4F] mt-1.5 flex-shrink-0" />
                  <span><strong>Doctor Adaptation:</strong> Fine-tune recognition models using calibration sheets per doctor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F52F4F] mt-1.5 flex-shrink-0" />
                  <span><strong>Human Verification:</strong> Surface field-level confidence scores; mandate staff confirmation for low-confidence tokens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F52F4F] mt-1.5 flex-shrink-0" />
                  <span><strong>Formulary & Patient Portals:</strong> Link confirmed prescriptions to pharmacy inventory SKUs and patient mobile views.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'functions-users',
      title: '2. Proposed Functions & Intended Users',
      category: 'Section 2/8',
      content: (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card-tactile p-5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E0F5EE] border-2 border-[#351027] flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-[#351027]" />
              </div>
              <h4 className="font-display font-extrabold text-sm text-[#351027]">Medical Doctors</h4>
              <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
                Write prescriptions naturally; submit 3 handwriting calibration sheets during onboarding.
              </p>
              <span className="pill-tag text-[10px]">Doctor Adaptation Profile</span>
            </div>

            <div className="card-tactile p-5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FFE8ED] border-2 border-[#351027] flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5 text-[#F52F4F]" />
              </div>
              <h4 className="font-display font-extrabold text-sm text-[#351027]">Clinic Staff</h4>
              <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
                Capture prescription photo, review AI-extracted tokens with highlighted uncertainty.
              </p>
              <span className="pill-tag-pink text-[10px]">Confidence Review Workspace</span>
            </div>

            <div className="card-tactile p-5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FFF0C8] border-2 border-[#351027] flex items-center justify-center mb-2">
                <Server className="w-5 h-5 text-amber-800" />
              </div>
              <h4 className="font-display font-extrabold text-sm text-[#351027]">Pharmacists</h4>
              <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
                Receive verified prescription queue, verify against real-time formulary stock levels.
              </p>
              <span className="pill-tag-gold text-[10px]">Inventory & SKU Sync</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'features-interfaces',
      title: '3. System Features & External Interfaces',
      category: 'Section 3/8',
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-tactile p-6 space-y-3">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#351027] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#F52F4F]" />
              Key Functional Modules
            </h3>
            <div className="p-3 bg-[#FFF8E8] rounded-xl border border-[#351027]">
              <div className="text-xs font-bold text-[#351027]">1. Handwriting Segmentation & CV Pipeline</div>
              <p className="text-xs text-[#351027]/70 mt-1 font-medium">Image binarization, line/word bounding-box detection, and CNN-Transformer feature extraction.</p>
            </div>
            <div className="p-3 bg-[#FFF8E8] rounded-xl border border-[#351027]">
              <div className="text-xs font-bold text-[#351027]">2. Confidence-Scored Parser</div>
              <p className="text-xs text-[#351027]/70 mt-1 font-medium">Assigns probability score per word; highlights uncertain medicine names in red/amber for review.</p>
            </div>
          </div>

          <div className="card-tactile p-6 space-y-3">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#351027] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F52F4F]" />
              External Interfaces & Adapters
            </h3>
            <div className="p-3 bg-[#FFF8E8] rounded-xl border border-[#351027]">
              <div className="text-xs font-bold text-[#351027]">Formulary & Inventory API Adapter</div>
              <p className="text-xs text-[#351027]/70 mt-1 font-medium">REST interface querying national drug registries and local clinic stock SKUs.</p>
            </div>
            <div className="p-3 bg-[#FFF8E8] rounded-xl border border-[#351027]">
              <div className="text-xs font-bold text-[#351027]">S3 / Supabase Object Storage Interface</div>
              <p className="text-xs text-[#351027]/70 mt-1 font-medium">Presigned upload URLs for high-resolution prescription scans, PPTX decks, and PDF reports.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'architecture',
      title: '4. Frontend, Backend, Storage & Deployment Architecture',
      category: 'Section 4/8',
      content: (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card-tactile p-5 text-center space-y-2">
            <span className="pill-tag-pink text-[10px]">Frontend Tier</span>
            <h4 className="font-display font-extrabold text-sm text-[#351027]">React + Vite SPA</h4>
            <p className="text-xs text-[#351027]/70 font-medium">Tactile design tokens, HashRouter routing.</p>
            <div className="mt-2 text-[11px] font-mono font-bold bg-[#FFF8E8] py-1 rounded-lg border border-[#351027]">GitHub Pages</div>
          </div>

          <div className="card-tactile p-5 text-center space-y-2">
            <span className="pill-tag text-[10px]">Backend Tier</span>
            <h4 className="font-display font-extrabold text-sm text-[#351027]">Node / Supabase</h4>
            <p className="text-xs text-slate-600 font-medium">PostgreSQL DB, Row Level Security, Express API.</p>
            <div className="mt-2 text-[11px] font-mono font-bold bg-[#FFF8E8] py-1 rounded-lg border border-[#351027]">Supabase DB</div>
          </div>

          <div className="card-tactile p-5 text-center space-y-2">
            <span className="pill-tag-gold text-[10px]">Storage Tier</span>
            <h4 className="font-display font-extrabold text-sm text-[#351027]">S3 Storage</h4>
            <p className="text-xs text-slate-600 font-medium">Supabase / AWS S3 buckets for decks, PDFs, calibration images.</p>
            <div className="mt-2 text-[11px] font-mono font-bold bg-[#FFF8E8] py-1 rounded-lg border border-[#351027]">S3 Buckets</div>
          </div>

          <div className="card-tactile p-5 text-center space-y-2">
            <span className="pill-tag-dark text-[10px]">DevOps</span>
            <h4 className="font-display font-extrabold text-sm text-[#351027]">CI / CD</h4>
            <p className="text-xs text-slate-600 font-medium">Automated build verification and GitHub Pages deployments.</p>
            <div className="mt-2 text-[11px] font-mono font-bold bg-[#FFF8E8] py-1 rounded-lg border border-[#351027]">Actions</div>
          </div>
        </div>
      ),
    },
    {
      id: 'performance-security',
      title: '5. Performance Goals & Security Measures',
      category: 'Section 5/8',
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-tactile p-6 space-y-3">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#351027] flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Target Performance Metrics
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#FFF8E8] rounded-xl border border-[#351027] flex justify-between">
                <span className="font-bold text-[#351027]">OCR Inference Time</span>
                <span className="font-extrabold text-[#F52F4F]">&lt; 1.2s per prescription sheet</span>
              </div>
              <div className="p-2.5 bg-[#FFF8E8] rounded-xl border border-[#351027] flex justify-between">
                <span className="font-bold text-[#351027]">Character Error Rate (CER)</span>
                <span className="font-extrabold text-emerald-700">&lt; 5.2% with doctor adaptation</span>
              </div>
              <div className="p-2.5 bg-[#FFF8E8] rounded-xl border border-[#351027] flex justify-between">
                <span className="font-bold text-[#351027]">Page Load & API Latency</span>
                <span className="font-extrabold text-indigo-700">p95 &lt; 200ms</span>
              </div>
            </div>
          </div>

          <div className="card-tactile p-6 space-y-3">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#351027] flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700" />
              Data Security & Access Control
            </h3>
            <ul className="space-y-2 text-xs text-[#351027]/80 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Role-Based Access Control (RBAC):</strong> Doctor, Staff, Pharmacist, Patient tiers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Encryption:</strong> AES-256 at rest in S3; TLS 1.3 in transit.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Audit Log:</strong> Immutable event timestamps for all prescription state changes.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'reliability-usability',
      title: '6. Reliability, Usability & Maintainability',
      category: 'Section 6/8',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card-tactile p-5 space-y-2">
            <h4 className="font-display font-extrabold text-sm text-[#351027]">Reliability</h4>
            <ul className="text-xs text-[#351027]/80 space-y-1.5 font-medium">
              <li>• Automated fallbacks for offline scanner feeds.</li>
              <li>• Immutable version logs preventing data loss.</li>
              <li>• Mandatory human confirmation before pharmacy dispatch.</li>
            </ul>
          </div>

          <div className="card-tactile p-5 space-y-2">
            <h4 className="font-display font-extrabold text-sm text-[#351027]">Usability</h4>
            <ul className="text-xs text-[#351027]/80 space-y-1.5 font-medium">
              <li>• Color-coded confidence highlights (Green &gt; 90%, Red &lt; 70%).</li>
              <li>• Mobile-responsive prescription review layout.</li>
              <li>• Tactile keyboard shortcuts for rapid staff verification.</li>
            </ul>
          </div>

          <div className="card-tactile p-5 space-y-2">
            <h4 className="font-display font-extrabold text-sm text-[#351027]">Maintainability</h4>
            <ul className="text-xs text-[#351027]/80 space-y-1.5 font-medium">
              <li>• Modular TypeScript services and adapters.</li>
              <li>• Automated CI/CD build tests on pull requests.</li>
              <li>• Self-contained SQLite / PostgreSQL schema migrations.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'risks-challenges',
      title: '7. Technical Risks & Expected Challenges',
      category: 'Section 7/8',
      content: (
        <div className="card-tactile p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-display font-extrabold text-base text-[#351027]">
              Risk Assessment & Mitigation Strategy
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#FFE8ED] rounded-xl border border-[#351027] space-y-1">
              <div className="font-display font-extrabold text-[#8F1230]">Risk 1: Doctor Handwriting Variance</div>
              <p className="text-[#351027]/80 font-medium">
                {presentationMeta.risksNote}
              </p>
            </div>

            <div className="p-3 bg-[#FFE8ED] rounded-xl border border-[#351027] space-y-1">
              <div className="font-display font-extrabold text-[#8F1230]">Risk 2: Medicine Name Ambiguity</div>
              <p className="text-[#351027]/80 font-medium">
                Mitigated with fuzzy Levenshtein formulary dictionary matching and mandatory staff confirmation.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'gantt-schedule',
      title: '8. 14-Week Milestone Schedule & Dependencies (Gantt Chart)',
      category: 'Section 8/8',
      content: (
        <div className="space-y-4">
          <GanttChart />
        </div>
      ),
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#351027]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="pill-tag-pink">{presentationMeta.version}</span>
            <span className="pill-tag-gold">UCS503 Presentation</span>
            <span className="pill-tag-dark">Live Deliverable</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            {presentationMeta.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#351027]/70 mt-2 font-bold">
            <span>📅 {presentationMeta.date}</span>
            <span>•</span>
            <span>👨‍🏫 Supervisor: {presentationMeta.supervisor}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Planning Presentation Button */}
          <button
            onClick={handleOpenEdit}
            className="btn-tactile btn-tactile-pink"
            title="Edit planning presentation content & attachments"
          >
            <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Deck & Files
            </span>
          </button>

          {/* Mode Switcher */}
          <div className="bg-white border-2 border-[#351027] rounded-xl p-1 flex gap-1 shadow-tactile-sm">
            <button
              onClick={() => setViewMode('slides')}
              className={`px-3 py-1 text-xs font-display font-extrabold rounded-lg transition-all ${
                viewMode === 'slides' ? 'bg-[#351027] text-white shadow-tactile-sm' : 'text-[#351027]'
              }`}
            >
              Slides Mode
            </button>
            <button
              onClick={() => setViewMode('document')}
              className={`px-3 py-1 text-xs font-display font-extrabold rounded-lg transition-all ${
                viewMode === 'document' ? 'bg-[#351027] text-white shadow-tactile-sm' : 'text-[#351027]'
              }`}
            >
              Document View
            </button>
          </div>

          <a
            href={presentationMeta.downloadUrl}
            download={presentationMeta.fileName}
            className="btn-tactile btn-tactile-gold"
          >
            <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download Deck
            </span>
          </a>
        </div>
      </div>

      {/* ─── SLIDE DECK MODE ────────────────────────────────────────────── */}
      {viewMode === 'slides' ? (
        <div className="space-y-4">
          <div className="card-tactile p-6 sm:p-10 min-h-[460px] flex flex-col justify-between relative bg-[#FFF8E8] border-[3px] border-[#351027]">
            {/* Slide Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#351027]/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="pill-tag text-[10px]">{slides[currentSlide].category}</span>
                <h2 className="font-display font-extrabold text-lg text-[#351027]">
                  {slides[currentSlide].title}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#351027]/60">
                Slide {currentSlide + 1} of {slides.length}
              </span>
            </div>

            {/* Slide Body */}
            <div className="flex-1 py-2">{slides[currentSlide].content}</div>

            {/* Slide Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-[#351027]/10 mt-6">
              <button
                onClick={prevSlide}
                className="btn-tactile btn-tactile-white"
                disabled={currentSlide === 0}
              >
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  Previous Slide
                </span>
              </button>

              <div className="flex gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all border border-[#351027] ${
                      currentSlide === idx ? 'bg-[#F52F4F] scale-125' : 'bg-white'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="btn-tactile btn-tactile-dark"
                disabled={currentSlide === slides.length - 1}
              >
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1">
                  Next Slide
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ─── FULL DOCUMENT VIEW (All 8 Sections Scrollable) ─────────────── */
        <div className="space-y-8">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="card-tactile p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
                <span className="pill-tag text-[10px]">{slide.category}</span>
                <h2 className="font-display font-extrabold text-base text-[#351027]">
                  {slide.title}
                </h2>
              </div>
              <div>{slide.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Edit Planning Presentation Modal ────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-[#351027]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF8E8] border-[3.5px] border-[#351027] rounded-4xl p-6 sm:p-8 max-w-2xl w-full shadow-tactile-xl relative animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#351027]">
              <div className="flex items-center gap-2">
                <MedicinePillMascot size={28} mood="smart" />
                <h3 className="heading-chunky text-xl text-[#351027]">
                  Edit Planning Presentation Deck
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-[#351027]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-[#E0F5EE] border border-[#351027] rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Presentation updated and persisted successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveDeck} className="space-y-4 text-xs font-bold text-[#351027]">
              {/* File Attachment Upload Section */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#351027] shadow-tactile-sm space-y-3">
                <label className="block uppercase tracking-wider text-[11px] text-[#351027]">
                  Attached Presentation File (.pptx / .pdf)
                </label>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFE8ED] border border-[#351027] flex items-center justify-center text-[#F52F4F]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#351027] truncate max-w-[200px]">
                        {editDraft.fileName || 'Pharmacon_Commitment_Pitch.pptx'}
                      </div>
                      <div className="text-[10px] text-[#351027]/60 font-medium">
                        Active download attachment
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pptx,.pdf,.zip,.ppt"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-tactile btn-tactile-pink"
                  >
                    <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Upload New File
                    </span>
                  </button>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Presentation Title *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.title}
                    onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Version Name *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.version}
                    onChange={(e) => setEditDraft({ ...editDraft, version: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.date}
                    onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Supervisor *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.supervisor}
                    onChange={(e) => setEditDraft({ ...editDraft, supervisor: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Authors (Comma-separated) *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.authors}
                    onChange={(e) => setEditDraft({ ...editDraft, authors: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Core Problem Description</label>
                  <textarea
                    rows={2}
                    value={editDraft.scopeProblem}
                    onChange={(e) => setEditDraft({ ...editDraft, scopeProblem: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Core Idea Tagline</label>
                  <input
                    type="text"
                    value={editDraft.scopeCoreIdea}
                    onChange={(e) => setEditDraft({ ...editDraft, scopeCoreIdea: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#351027]/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-tactile btn-tactile-white"
                >
                  <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold">
                    Cancel
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-tactile btn-tactile-gold"
                >
                  <span className="btn-tactile-inner py-1.5 px-5 text-xs font-extrabold flex items-center gap-1.5">
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Presentation Changes
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
