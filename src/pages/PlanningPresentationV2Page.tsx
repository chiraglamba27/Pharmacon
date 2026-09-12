import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Sparkles, Layers,
  FileText, Download, ArrowRight, ShieldCheck, Edit3, X, Save, Upload, Loader2, Check
} from 'lucide-react';
import GanttChart from '../components/GanttChart';
import MedicinePillMascot from '../components/MedicinePillMascot';
import { api } from '../api/client';

export default function PlanningPresentationV2Page() {
  const [presentationMeta, setPresentationMeta] = useState({
    title: 'Project Planning Presentation v2 (Scope Revisions & Cloud Sync)',
    version: 'Planning Presentation v2.0.0',
    date: 'September 10, 2026',
    authors: 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
    parentVersion: 'Planning Presentation v1.0.0',
    downloadUrl: '/presentations/Pharmacon_Commitment_Pitch.pptx',
    fileName: 'Pharmacon_Commitment_Pitch.pptx',
    changeSummary: 'Following supervisor review of Planning v1, Version 2 integrates explicit writer recruitment quotas (minimum 3 participating medical doctors), transitions object storage to S3/Supabase Storage buckets, and formalizes an active feedback learning loop for low-confidence prescription corrections.',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(presentationMeta);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem('pharmacon_planning_v2_meta');
    if (cached) {
      try {
        setPresentationMeta(JSON.parse(cached));
      } catch (e) {}
    }

    api.get<{ sections: any }>('/content/page/planning-v2')
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
      await api.put('/content/page/planning-v2/meta', { items: [editDraft] });
    } catch (e) {
    } finally {
      setPresentationMeta(editDraft);
      localStorage.setItem('pharmacon_planning_v2_meta', JSON.stringify(editDraft));
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
      }, 700);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Banner & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="pill-tag-pink">{presentationMeta.version}</span>
            <span className="pill-tag-gold">Revised Scope Deliverable</span>
            <span className="pill-tag-dark">Supabase + S3 Architecture</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            {presentationMeta.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#351027]/70 mt-2 font-bold">
            <span>📅 <strong>Date:</strong> {presentationMeta.date}</span>
            <span>•</span>
            <span>✍️ <strong>Authors:</strong> {presentationMeta.authors}</span>
            <span>•</span>
            <span>🔗 <strong>Parent Deliverable:</strong> <Link to="/presentation/v1" className="text-[#F52F4F] underline font-bold">Planning v1</Link></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Button */}
          <button
            onClick={handleOpenEdit}
            className="btn-tactile btn-tactile-pink"
            title="Edit planning v2 content and files"
          >
            <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Deck & File
            </span>
          </button>

          <Link to="/presentation/v1" className="btn-tactile btn-tactile-white">
            <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Planning v1
            </span>
          </Link>

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

      {/* Version Change Summary Card */}
      <div className="card-tactile p-6 bg-[#FFE8ED] border-2 border-[#351027] space-y-3">
        <div className="flex items-center gap-2">
          <MedicinePillMascot size={28} mood="sparkle" />
          <h3 className="font-display font-extrabold text-base text-[#8F1230]">
            What Changed in Planning v2?
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#351027]/80 leading-relaxed font-medium">
          {presentationMeta.changeSummary}
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3 bg-white rounded-2xl border border-[#351027] shadow-tactile-sm">
            <span className="font-display font-extrabold text-[#F52F4F] block mb-1">1. Writer Recruitment</span>
            <span className="text-[#351027]/70 font-medium">Enrolled 3 clinical practitioners for 3-sheet handwriting calibration baseline.</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#351027] shadow-tactile-sm">
            <span className="font-display font-extrabold text-[#F52F4F] block mb-1">2. Cloud Object Storage</span>
            <span className="text-[#351027]/70 font-medium">Replaced local-only file uploads with Supabase S3-compatible storage buckets.</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#351027] shadow-tactile-sm">
            <span className="font-display font-extrabold text-[#F52F4F] block mb-1">3. Live GitHub Pages SPA</span>
            <span className="text-[#351027]/70 font-medium">Configured automated static publishing on public GitHub Pages subdomain.</span>
          </div>
        </div>
      </div>

      {/* Side-by-side Scope Diff */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-tactile p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10 mb-2">
            <span className="text-xs font-display font-extrabold uppercase text-[#351027]/60">Planning v1 Baseline</span>
            <span className="pill-tag text-[10px]">v1.0.0</span>
          </div>
          <ul className="space-y-3 text-xs text-[#351027]/80 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#351027] mt-1.5 flex-shrink-0" />
              <span>General prescription OCR with basic dictionary lookup.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#351027] mt-1.5 flex-shrink-0" />
              <span>Local server SQLite database and file storage directory.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#351027] mt-1.5 flex-shrink-0" />
              <span>Theoretical writer calibration workflow.</span>
            </li>
          </ul>
        </div>

        <div className="card-tactile p-6 bg-[#E0F5EE] border-2 border-[#351027] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10 mb-2">
            <span className="text-xs font-display font-extrabold uppercase text-emerald-900">Planning v2 Upgrades</span>
            <span className="pill-tag-dark text-[10px]">v2.0.0</span>
          </div>
          <ul className="space-y-3 text-xs text-[#351027] font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>Doctor-specific fine-tuning embeddings trained on 3 sheets per practitioner.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>Hybrid Supabase PostgreSQL + S3 cloud storage for public deliverable links.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>Real-time confidence thresholding and staff active-learning feedback loop.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Updated Roadmap Section */}
      <section className="space-y-4">
        <h3 className="heading-chunky text-xl text-[#351027]">
          Revised Milestone Schedule (Gantt Chart)
        </h3>
        <GanttChart />
      </section>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-[#351027]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF8E8] border-[3.5px] border-[#351027] rounded-4xl p-6 sm:p-8 max-w-2xl w-full shadow-tactile-xl relative animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#351027]">
              <div className="flex items-center gap-2">
                <MedicinePillMascot size={28} mood="smart" />
                <h3 className="heading-chunky text-xl text-[#351027]">
                  Edit Planning v2 Deck & Attachments
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
                <span>Planning v2 updated and persisted!</span>
              </div>
            )}

            <form onSubmit={handleSaveDeck} className="space-y-4 text-xs font-bold text-[#351027]">
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
                        {editDraft.fileName}
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.title}
                    onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
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

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Authors *</label>
                  <input
                    type="text"
                    required
                    value={editDraft.authors}
                    onChange={(e) => setEditDraft({ ...editDraft, authors: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Scope Revision Summary *</label>
                  <textarea
                    rows={3}
                    required
                    value={editDraft.changeSummary}
                    onChange={(e) => setEditDraft({ ...editDraft, changeSummary: e.target.value })}
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
                        Save Changes
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
