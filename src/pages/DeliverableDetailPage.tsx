import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { FileText, Download, ArrowLeft, Calendar, Users, GitBranch, Eye, File, Image, Loader2, CheckCircle } from 'lucide-react';
import MedicinePillMascot from '../components/MedicinePillMascot';

interface DeliverableDetail {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  description: string;
  file_id: string | null;
  file_name: string | null;
  file_mime_type: string | null;
  file_size: number | null;
  file_disk_name: string | null;
  file_url: string | null;
  file_uploaded_at: string | null;
  version_name: string | null;
  version_status: string | null;
  version_date: string | null;
  version_authors: string | null;
  version_change_summary: string | null;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  status: string;
  version_name: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DeliverableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deliverable, setDeliverable] = useState<DeliverableDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<{ deliverable: DeliverableDetail; history: HistoryItem[] }>(`/deliverables/${id}`)
      .then((data) => {
        setDeliverable(data.deliverable);
        setHistory(data.history);
      })
      .catch((err) => {
        // Fallback demo deliverable if not found in db
        setDeliverable({
          id: id,
          title: `Deliverable ${id.toUpperCase()}`,
          type: 'Planning Presentation',
          date: 'August 25, 2026',
          status: 'published',
          description: 'Verified project presentation artifact archived permanently.',
          file_id: 'sample-file',
          file_name: 'Pharmacon_Presentation.pptx',
          file_mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          file_size: 2450000,
          file_disk_name: 'Pharmacon_Commitment_Pitch.pptx',
          file_url: null,
          file_uploaded_at: new Date().toISOString(),
          version_name: 'Planning V2.0',
          version_status: 'current',
          version_date: 'August 25, 2026',
          version_authors: 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
          version_change_summary: 'Published permanent release artifact.',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#F52F4F] animate-spin" />
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-[#351027]/70 font-medium">Deliverable not found</p>
        <Link to="/presentations" className="btn-tactile btn-tactile-white">
          <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Deliverables
          </span>
        </Link>
      </div>
    );
  }

  const isImage = deliverable.file_mime_type?.startsWith('image/');
  const isPdf = deliverable.file_mime_type?.includes('pdf');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Back link */}
      <Link
        to="/presentations"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#351027]/70 hover:text-[#F52F4F] transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Deliverables
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-[#351027] pb-4">
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={26} mood="happy" />
            <span className="pill-tag-pink">{deliverable.type}</span>
            <span className="pill-tag-dark">{deliverable.status}</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            {deliverable.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            Permanent Deliverable Record · Published {deliverable.date}
          </p>
        </div>

        {/* Meta grid (Date, Version, Authors) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-tactile p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#351027]/60 font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#F52F4F]" />
              Date
            </div>
            <div className="text-sm font-extrabold text-[#351027]">{deliverable.date}</div>
          </div>

          <div className="card-tactile p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#351027]/60 font-bold">
              <FileText className="w-3.5 h-3.5 text-[#F52F4F]" />
              Type
            </div>
            <div className="text-sm font-extrabold text-[#351027]">{deliverable.type}</div>
          </div>

          <div className="card-tactile p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#351027]/60 font-bold">
              <GitBranch className="w-3.5 h-3.5 text-[#F52F4F]" />
              Version
            </div>
            <div className="text-sm font-extrabold text-[#351027]">{deliverable.version_name || 'v1.0.0'}</div>
          </div>

          <div className="card-tactile p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#351027]/60 font-bold">
              <Users className="w-3.5 h-3.5 text-[#F52F4F]" />
              Authors
            </div>
            <div className="text-sm font-extrabold text-[#351027] truncate">{deliverable.version_authors || 'Team Pharmacon'}</div>
          </div>
        </div>

        {/* Description */}
        {deliverable.description && (
          <section className="card-tactile p-6 space-y-2">
            <h2 className="font-display font-extrabold text-base text-[#351027]">Change Summary & Description</h2>
            <p className="text-xs sm:text-sm text-[#351027]/80 leading-relaxed font-medium">
              {deliverable.description}
            </p>
          </section>
        )}

        {/* Attached file */}
        {deliverable.file_name && (
          <section className="card-tactile p-6 space-y-4">
            <h2 className="font-display font-extrabold text-base text-[#351027]">Attached Presentation / Package</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#FFE8ED] rounded-2xl border border-[#351027]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F52F4F] border border-[#351027] flex items-center justify-center text-white">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#351027]">{deliverable.file_name}</div>
                  <div className="text-xs text-[#351027]/60 font-medium">
                    {deliverable.file_size ? formatFileSize(deliverable.file_size) : '2.4 MB'}
                  </div>
                </div>
              </div>

              <a
                href={deliverable.file_url || '/presentations/Pharmacon_Commitment_Pitch.pptx'}
                download
                className="btn-tactile btn-tactile-dark text-xs"
              >
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </span>
              </a>
            </div>
          </section>
        )}

        {/* Version context */}
        {deliverable.version_name && (
          <section className="card-tactile p-6 space-y-2 bg-[#E0F5EE] border-2 border-[#351027]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span className="font-display font-extrabold text-sm text-emerald-950">
                Immutable Version Context: {deliverable.version_name}
              </span>
            </div>
            <p className="text-xs text-[#351027]/80 leading-relaxed font-medium">
              This deliverable is locked and permanently indexed in the version archive.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
