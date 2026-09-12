import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import VersionTimeline from '../components/VersionTimeline';
import { GitBranch, Plus, Loader2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import MedicinePillMascot from '../components/MedicinePillMascot';

interface Version {
  id: string;
  name: string;
  date: string;
  authors: string;
  status: string;
  change_summary: string;
  commit_ref: string;
  deployment_url: string;
  parent_version_id: string | null;
}

export default function VersionsPage() {
  const { isAdmin } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', date: '', authors: 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba', status: 'current',
    changeSummary: '', commitRef: '', deploymentUrl: '', parentVersionId: '',
  });

  useEffect(() => {
    api.get<{ versions: Version[] }>('/versions')
      .then((data) => setVersions(data.versions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createVersion = async () => {
    setCreating(true);
    try {
      const result = await api.post<{ version: Version }>('/versions', form);
      setVersions((prev) => [...prev, result.version]);
      setShowCreate(false);
      setForm({ name: '', date: '', authors: 'Team Pharmacon', status: 'current', changeSummary: '', commitRef: '', deploymentUrl: '', parentVersionId: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#F52F4F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={28} mood="smart" />
            <span className="pill-tag-pink">Project Version Control</span>
            <span className="pill-tag">Immutable Releases</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Version History & Deliverable Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            All historical presentation releases and packages remain permanently accessible. Older deliverables are never overwritten.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/publish" className="btn-tactile btn-tactile-gold">
            <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Publish New Version
            </span>
          </Link>
        </div>
      </div>

      {/* Main List and Details */}
      <div className="max-w-4xl space-y-8">
        {/* Timeline */}
        <div className="card-tactile p-6 space-y-4">
          <h3 className="font-display font-extrabold text-base text-[#351027] mb-2">
            Chronological Deliverable Releases
          </h3>
          <VersionTimeline
            versions={versions}
            selectedId={selectedId}
            onSelect={(v) => setSelectedId(v.id === selectedId ? undefined : v.id)}
          />
        </div>

        {/* Selected Version Detail */}
        {selectedId && (() => {
          const v = versions.find(ver => ver.id === selectedId);
          if (!v) return null;
          return (
            <section className="card-tactile p-6 space-y-4 bg-[#FFE8ED] border-2 border-[#351027]">
              <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
                <h3 className="font-display font-extrabold text-base text-[#8F1230]">
                  Version Detail: {v.name}
                </h3>
                <span className="pill-tag-dark text-[10px]">{v.status}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] text-[#351027]/50 uppercase font-bold">Release Date</div>
                  <div className="font-bold text-[#351027]">{v.date}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#351027]/50 uppercase font-bold">Authors</div>
                  <div className="font-bold text-[#351027]">{v.authors}</div>
                </div>
              </div>

              {v.change_summary && (
                <div className="border-t border-[#351027]/10 pt-3">
                  <div className="text-[10px] text-[#351027]/50 uppercase font-bold mb-1">What Changed</div>
                  <p className="text-xs text-[#351027]/80 leading-relaxed font-medium">{v.change_summary}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to={v.id === 'v1' ? '/presentation/v1' : v.id === 'v2' ? '/presentation/v2' : `/deliverable/${v.id}`}
                  className="btn-tactile btn-tactile-dark"
                >
                  <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
                    Launch Deliverable Page
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );
}
