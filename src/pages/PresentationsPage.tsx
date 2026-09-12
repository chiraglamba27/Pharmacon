import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Eye, Loader2, ExternalLink, Plus, Pencil,
  Trash2, X, Check, Download, Upload, Sparkles, FolderUp
} from 'lucide-react';
import MedicinePillMascot from '../components/MedicinePillMascot';

interface Deck {
  id: string;
  title: string;
  description: string;
  filePath: string;
  sortOrder: number;
}

interface Deliverable {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  description: string;
  file_name: string | null;
  version_name: string | null;
  version_status: string | null;
}

export default function PresentationsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isAdmin } = useAuth();

  // Edit state for decks
  const [editingDeck, setEditingDeck] = useState<string | null>(null);
  const [deckDraft, setDeckDraft] = useState({ title: '', description: '', filePath: '' });
  const [addingDeck, setAddingDeck] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ decks: Deck[] }>('/content/decks'),
      api.get<{ deliverables: Deliverable[] }>('/deliverables'),
    ])
      .then(([deckData, delivData]) => {
        setDecks(deckData.decks || []);
        setDeliverables(delivData.deliverables || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEditDeck = (deck: Deck) => {
    setEditingDeck(deck.id);
    setDeckDraft({ title: deck.title, description: deck.description, filePath: deck.filePath });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const result = await api.upload<{ files: Array<{ fileUrl: string }> }>('/files/upload', [file]);
      const uploaded = result.files[0];
      if (!uploaded) throw new Error('File upload failed');
      setDeckDraft((prev) => ({ ...prev, filePath: uploaded.fileUrl }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const saveDeck = async () => {
    if (!editingDeck) return;
    setSaving(true);
    try {
      await api.put(`/content/decks/${editingDeck}`, deckDraft);
      setDecks((prev) => prev.map((d) => (d.id === editingDeck ? { ...d, ...deckDraft } : d)));
      setEditingDeck(null);
    } finally {
      setSaving(false);
    }
  };

  const addDeck = async () => {
    setSaving(true);
    try {
      const newDeck = await api.post<Deck>('/content/decks', deckDraft);
      setDecks((prev) => [...prev, newDeck]);
      setAddingDeck(false);
      setDeckDraft({ title: '', description: '', filePath: '' });
    } finally {
      setSaving(false);
    }
  };

  const deleteDeck = async (id: string) => {
    if (!confirm('Are you sure you want to remove this presentation?')) return;
    await api.delete(`/content/decks/${id}`);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#F52F4F] animate-spin" />
      </div>
    );
  }

  // Group deliverables by version
  const byVersion: Record<string, Deliverable[]> = {};
  const noVersion: Deliverable[] = [];

  deliverables.forEach((d) => {
    if (d.version_name) {
      if (!byVersion[d.version_name]) byVersion[d.version_name] = [];
      byVersion[d.version_name].push(d);
    } else {
      noVersion.push(d);
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={28} mood="smart" />
            <span className="pill-tag-pink">Presentation Archive</span>
            <span className="pill-tag">Live Deliverables</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Presentations & Project Deliverables
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            Browse and download presentation decks, planning milestones, and permanent deliverable records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/publish" className="btn-tactile btn-tactile-gold">
            <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
              <FolderUp className="w-3.5 h-3.5" />
              Upload New Deliverable
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Supplied Presentations Deck Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-chunky text-xl text-[#351027]">
              Presentation Pitch Decks
            </h2>
            {isAdmin && !addingDeck && (
              <button
                onClick={() => {
                  setAddingDeck(true);
                  setDeckDraft({ title: '', description: '', filePath: '' });
                }}
                className="btn-tactile btn-tactile-white"
              >
                <span className="btn-tactile-inner py-1 px-3 text-xs font-extrabold flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-[#F52F4F]" />
                  Add Pitch Deck
                </span>
              </button>
            )}
          </div>

          {/* Add New Deck Form */}
          {isAdmin && addingDeck && (
            <div className="card-tactile p-5 bg-[#FFE8ED] border-2 border-[#351027] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#351027]/10">
                <span className="text-xs font-display font-extrabold text-[#8F1230] uppercase">
                  Add New Presentation File
                </span>
                <button onClick={() => setAddingDeck(false)} className="text-[#351027]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Presentation Title"
                value={deckDraft.title}
                onChange={(e) => setDeckDraft({ ...deckDraft, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#351027] text-xs font-bold"
              />

              <textarea
                placeholder="Description / Topics covered"
                value={deckDraft.description}
                onChange={(e) => setDeckDraft({ ...deckDraft, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#351027] text-xs font-medium"
                rows={2}
              />

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="File download path (or upload below)"
                  value={deckDraft.filePath}
                  onChange={(e) => setDeckDraft({ ...deckDraft, filePath: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#351027] text-xs"
                />
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-tactile btn-tactile-pink"
                >
                  <span className="btn-tactile-inner py-1.5 px-3 text-xs font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAddingDeck(false)} className="btn-tactile btn-tactile-white">
                  <span className="btn-tactile-inner py-1 px-3 text-xs font-bold">Cancel</span>
                </button>
                <button
                  onClick={addDeck}
                  disabled={saving || !deckDraft.title}
                  className="btn-tactile btn-tactile-dark"
                >
                  <span className="btn-tactile-inner py-1 px-4 text-xs font-bold">
                    {saving ? 'Saving...' : 'Add Deck'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Decks Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {decks.map((deck) => (
              isAdmin && editingDeck === deck.id ? (
                <div key={deck.id} className="card-tactile p-5 bg-[#FFE8ED] border-2 border-[#351027] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#351027]/10">
                    <span className="text-xs font-display font-extrabold text-[#8F1230]">
                      Edit Deck: {deck.title}
                    </span>
                    <button onClick={() => setEditingDeck(null)} className="text-[#351027]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={deckDraft.title}
                    onChange={(e) => setDeckDraft({ ...deckDraft, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#351027] text-xs font-bold"
                  />
                  <textarea
                    value={deckDraft.description}
                    onChange={(e) => setDeckDraft({ ...deckDraft, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#351027] text-xs font-medium"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={deckDraft.filePath}
                    onChange={(e) => setDeckDraft({ ...deckDraft, filePath: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#351027] text-xs"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditingDeck(null)} className="btn-tactile btn-tactile-white">
                      <span className="btn-tactile-inner py-1 px-3 text-xs font-bold">Cancel</span>
                    </button>
                    <button onClick={saveDeck} disabled={saving} className="btn-tactile btn-tactile-gold">
                      <span className="btn-tactile-inner py-1 px-4 text-xs font-bold">Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={deck.id}
                  className="card-tactile p-6 space-y-3 flex flex-col justify-between hover:-translate-y-1 transition-transform relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-[#FFE8ED] border border-[#351027] flex items-center justify-center text-[#F52F4F]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        {isAdmin && <button
                          onClick={() => startEditDeck(deck)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-[#351027]"
                          title="Edit presentation"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>}
                        {isAdmin && (
                          <button
                            onClick={() => deleteDeck(deck.id)}
                            className="p-1 rounded-lg hover:bg-red-100 text-red-600"
                            title="Delete presentation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="font-display font-extrabold text-base text-[#351027]">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-[#351027]/70 font-medium leading-relaxed mt-1">
                      {deck.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#351027]/10 flex items-center justify-between">
                    <a
                      href={deck.filePath || '/presentations/Pharmacon_Commitment_Pitch.pptx'}
                      download
                      className="btn-tactile btn-tactile-white"
                    >
                      <span className="btn-tactile-inner py-1 px-3 text-xs font-extrabold flex items-center gap-1.5">
                        <Download className="w-3 h-3 text-[#F52F4F]" />
                        Download PPTX
                      </span>
                    </a>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Deliverables by Version */}
        {Object.entries(byVersion).map(([versionName, items]) => (
          <section key={versionName} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="heading-chunky text-lg text-[#351027]">
                {versionName} Deliverables
              </h2>
              <span className="pill-tag text-[10px]">Archived Releases</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((d) => (
                <Link
                  key={d.id}
                  to={`/deliverable/${d.id}`}
                  className="card-tactile p-4 space-y-2 hover:-translate-y-1 transition-transform block"
                >
                  <div className="flex items-center justify-between">
                    <span className="pill-tag-pink text-[10px]">{d.type}</span>
                    <span className="text-[10px] font-bold text-[#351027]/60">{d.date}</span>
                  </div>

                  <h3 className="font-display font-extrabold text-sm text-[#351027]">
                    {d.title}
                  </h3>

                  <div className="pt-2 border-t border-[#351027]/10 text-xs font-bold text-[#F52F4F] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    View Deliverable Details →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
