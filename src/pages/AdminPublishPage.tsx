import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload, CheckCircle, AlertCircle, Loader2,
  FileText, ArrowRight, ShieldCheck, Sparkles, FolderUp, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FileUploader from '../components/FileUploader';
import { storageService } from '../lib/supabase';
import MedicinePillMascot from '../components/MedicinePillMascot';

export default function AdminPublishPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [versionName, setVersionName] = useState('Planning V2.1');
  const [type, setType] = useState('Planning Presentation');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [authors, setAuthors] = useState(user?.name || 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba');
  const [changeSummary, setChangeSummary] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<{
    id: string;
    versionId: string;
    permanentUrl: string;
  } | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !versionName || !changeSummary) {
      alert('Please fill in Title, Version, and Change Summary.');
      return;
    }

    setIsPublishing(true);
    try {
      const versionId = versionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newVersion = await storageService.publishVersion({
        id: versionId,
        name: versionName,
        date,
        authors,
        status: 'current',
        change_summary: changeSummary,
        deployment_url: `#/deliverable/${versionId}`,
        file_url: uploadedFiles[0]?.fileUrl || '',
      });

      const newDeliverable = await storageService.publishDeliverable({
        id: `deliv-${Date.now().toString(36)}`,
        title,
        type,
        version_id: newVersion.id,
        version_name: newVersion.name,
        date,
        status: 'published',
        description: changeSummary,
        file_name: uploadedFiles[0]?.originalName || 'Presentation_File.pptx',
        file_url: uploadedFiles[0]?.fileUrl || '',
        authors,
      });

      setPublishedResult({
        id: newDeliverable.id,
        versionId: newVersion.id,
        permanentUrl: `/deliverable/${newDeliverable.id}`,
      });
    } catch (err: any) {
      console.error('Publishing error:', err);
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-[#351027] pb-6">
        <div className="flex items-center gap-2 mb-2">
          <MedicinePillMascot size={28} mood="smart" />
          <span className="pill-tag-pink">Admin Portal</span>
          <span className="pill-tag-gold">Publishing Engine</span>
        </div>
        <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
          Upload & Publish Deliverable
        </h1>
        <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
          Upload new presentations or packages, assign version metadata, and generate permanent deliverable URLs without overwriting previous versions.
        </p>
      </div>

      {/* Success Notification */}
      {publishedResult && (
        <div className="p-5 rounded-3xl bg-[#E0F5EE] border-2 border-[#351027] text-emerald-950 space-y-2 shadow-tactile">
          <div className="flex items-center gap-2 font-display font-extrabold text-sm text-emerald-900">
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <span>Deliverable Successfully Published to Permanent Page!</span>
          </div>
          <p className="text-xs text-[#351027]/80 font-medium">
            The new version <strong>{versionName}</strong> is now live. Older versions remain fully archived in the Version History log.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={publishedResult.permanentUrl} className="btn-tactile btn-tactile-dark">
              <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1">
                Open Permanent Page
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <Link to="/versions" className="btn-tactile btn-tactile-white">
              <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold">
                View Version History
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePublish} className="space-y-6">
        {/* Step 1: Upload */}
        <div className="card-tactile p-6 space-y-4">
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#351027] flex items-center gap-2">
            <FolderUp className="w-4 h-4 text-[#F52F4F]" />
            1. Drag & Drop Presentation / Folder Attachment
          </h3>
          <FileUploader onUploadComplete={setUploadedFiles} />
        </div>

        {/* Step 2: Metadata */}
        <div className="card-tactile p-6 space-y-4">
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-[#351027] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F52F4F]" />
            2. Deliverable Metadata & Version Details
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Planning Presentation v2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">Version *</label>
              <input
                type="text"
                required
                placeholder="e.g. Planning V2"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">Deliverable Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
              >
                <option value="Planning Presentation">Planning Presentation</option>
                <option value="Interactive Prototype Demo">Interactive Prototype Demo</option>
                <option value="Mid-Sem Progress Report">Mid-Sem Progress Report</option>
                <option value="Software Grid Specification">Software Grid Specification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">Presentation Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">Authors / Presenters</label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#351027] uppercase tracking-wider mb-1">Change Summary *</label>
              <textarea
                required
                rows={3}
                placeholder="Summarize what was updated in this deliverable version..."
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#351027] bg-[#FFF8E8] text-xs font-bold text-[#351027] focus:outline-none focus:ring-2 focus:ring-[#F52F4F]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Link to="/presentations" className="btn-tactile btn-tactile-white">
            <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold">
              Cancel
            </span>
          </Link>
          <button
            type="submit"
            disabled={isPublishing}
            className="btn-tactile btn-tactile-gold disabled:opacity-50"
          >
            <span className="btn-tactile-inner py-2 px-6 text-xs font-extrabold flex items-center gap-2">
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing to Permanent Page...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publish Deliverable to Permanent Page
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
