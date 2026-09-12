import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../lib/supabase';
import {
  Loader2, Github, Linkedin, Save, Edit3, X,
  UserCheck, Sparkles, CheckCircle, Camera, Check, Crop
} from 'lucide-react';
import MedicinePillMascot from '../components/MedicinePillMascot';
import ImageCropperModal from '../components/ImageCropperModal';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  skills: string;
  github_url: string;
  linkedin_url: string;
  avatar_file_id?: string | null;
  avatar_filename?: string | null;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'T-001',
    name: 'Aryan Sharma',
    role: 'Frontend Lead',
    focus: 'UI/UX architecture, responsive design system, tactile component library, and interactive presentations.',
    avatar: 'AS',
    skills: 'React, Vite, TypeScript, Tailwind CSS, UI/UX Design, Recharts',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-002',
    name: 'Aniket Raj',
    role: 'Backend Lead',
    focus: 'Express API development, database persistence, S3/Supabase storage integrations, and permanent version publishing engine.',
    avatar: 'AR',
    skills: 'Node.js, Express, SQLite, PostgreSQL, Supabase, S3 Storage, REST APIs',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-003',
    name: 'Amitesh Kumar Singh',
    role: 'AI / CV Engineer',
    focus: 'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.',
    avatar: 'AK',
    skills: 'Python, PyTorch, Computer Vision, OCR, CNN-Transformers, Image Processing',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-004',
    name: 'Chirag Lamba',
    role: 'Integration Lead',
    focus: 'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.',
    avatar: 'CL',
    skills: 'CI/CD, GitHub Actions, System Integration, End-to-End Testing, Security Audit',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
];

export default function TeamPage() {
  const { isAuthenticated, user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const cached = localStorage.getItem('pharmacon_team_members');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_MEMBERS;
  });
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: string;
    focus: string;
    skills: string;
    avatar: string;
    github_url: string;
    linkedin_url: string;
  }>({
    name: '',
    role: '',
    focus: '',
    skills: '',
    avatar: '',
    github_url: '',
    linkedin_url: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch team from Supabase Cloud / API on mount and merge with local edits
  useEffect(() => {
    storageService.getTeamMembers()
      .then((members) => {
        if (members && members.length > 0) {
          const merged = DEFAULT_MEMBERS.map((def) => {
            const remote = members.find((m: any) => m.id === def.id);
            return remote ? { ...def, ...remote } : def;
          });
          setTeam(merged);
          localStorage.setItem('pharmacon_team_members', JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      role: member.role,
      focus: member.focus,
      skills: member.skills || '',
      avatar: member.avatar,
      github_url: member.github_url || '',
      linkedin_url: member.linkedin_url || '',
    });
    setAvatarPreview(member.avatar);
    setSaveSuccess(false);
  };

  // Handle local photo file upload & open interactive crop/resize modal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setRawImageForCrop(base64);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleCropComplete = (croppedBase64: string) => {
    setAvatarPreview(croppedBase64);
    setEditForm((prev) => ({ ...prev, avatar: croppedBase64 }));
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaving(true);
    setSaveSuccess(false);

    const finalAvatar = avatarPreview || editForm.avatar || editingMember.avatar;

    const payload = {
      name: editForm.name,
      role: editForm.role,
      focus: editForm.focus,
      skills: editForm.skills,
      avatar: finalAvatar,
      github_url: editForm.github_url,
      linkedin_url: editForm.linkedin_url,
    };

    const updatedMember: TeamMember = {
      ...editingMember,
      ...payload,
      avatar: finalAvatar,
    };

    // 1. Immediately update React state & localStorage
    const updatedList = team.map((m) => (m.id === editingMember.id ? updatedMember : m));
    setTeam(updatedList);
    localStorage.setItem('pharmacon_team_members', JSON.stringify(updatedList));

    // Dispatch global storage event for Homepage sync
    window.dispatchEvent(new Event('pharmacon_team_updated'));

    // 2. Persist to Supabase Cloud & Backend SQLite database
    try {
      await storageService.updateTeamMember(editingMember.id, payload);
    } catch (err) {
      console.warn('Backend sync warning, stored locally:', err);
    } finally {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setEditingMember(null);
      }, 700);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center min-h-[50vh]">
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
            <MedicinePillMascot size={28} mood="happy" />
            <span className="pill-tag-pink">Core Team</span>
            <span className="pill-tag">Engineering 2026</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Team Pharmacon
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            Meet the 4 engineers behind Pharmacon. Click "Edit Profile & Photo" on any card to update skills, roles, and profile pictures.
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2 p-2 px-3 bg-[#FFE8ED] border-2 border-[#351027] rounded-2xl shadow-tactile-sm">
            <UserCheck className="w-4 h-4 text-[#F52F4F]" />
            <span className="text-xs font-extrabold text-[#8F1230]">
              Signed in as {user?.name} (Admin Editor Active)
            </span>
          </div>
        )}
      </div>

      {/* ─── Team Grid with 4 Editable Cards ────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {team.map((member) => {
          const initials = member.name.split(' ').map((n) => n[0]).join('');
          const skillsList = member.skills ? member.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
          const isPhoto = member.avatar && (member.avatar.startsWith('data:image') || member.avatar.startsWith('http') || member.avatar_filename);

          return (
            <div
              key={member.id}
              className="card-tactile p-6 space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform relative group"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-4">
                    {/* Enlarged Circular Avatar Profile Picture or Initials */}
                    {isPhoto ? (
                      <img
                        src={member.avatar_filename ? `/uploads/${member.avatar_filename}` : member.avatar}
                        alt={member.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-[3.5px] border-[#351027] shadow-tactile bg-white flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFE8ED] border-[3.5px] border-[#351027] flex items-center justify-center font-display font-black text-2xl text-[#F52F4F] shadow-tactile flex-shrink-0">
                        {member.avatar || initials}
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#351027]">
                        {member.name}
                      </h3>
                      <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-[#F52F4F] text-white border border-[#351027] shadow-tactile-sm">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="btn-tactile btn-tactile-white"
                    title="Edit profile and photo"
                  >
                    <span className="btn-tactile-inner py-1 px-3 text-[11px] font-extrabold flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-[#F52F4F]" />
                      Edit Profile & Photo
                    </span>
                  </button>
                </div>

                {/* Focus / Bio */}
                <p className="text-xs sm:text-sm text-[#351027]/80 leading-relaxed font-medium mt-3">
                  {member.focus}
                </p>

                {/* Skills Tags */}
                {skillsList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#351027]/10 space-y-1.5">
                    <div className="text-[10px] font-display font-extrabold uppercase tracking-wider text-[#351027]/60">
                      Technical Skills & Expertise:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-[#FFF8E8] border border-[#351027] text-[10px] font-bold text-[#351027] shadow-tactile-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="pt-3 border-t border-[#351027]/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {member.github_url && (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#351027]/70 hover:text-[#F52F4F] transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#351027]/70 hover:text-[#F52F4F] transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>

                <span className="text-[10px] font-mono font-bold text-[#351027]/50">
                  ID: {member.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Edit Team Member & Profile Photo Modal ─────────────────────── */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-[#351027]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF8E8] border-[3.5px] border-[#351027] rounded-4xl p-6 sm:p-8 max-w-2xl w-full shadow-tactile-xl relative animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#351027]">
              <div className="flex items-center gap-2">
                <MedicinePillMascot size={28} mood="smart" />
                <h3 className="heading-chunky text-xl text-[#351027]">
                  Edit Profile: {editingMember.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-[#351027]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-[#E0F5EE] border border-[#351027] rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Profile & Photo saved permanently!</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs font-bold text-[#351027]">
              {/* Profile Photo Editor Section */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#351027] shadow-tactile-sm space-y-3">
                <label className="block uppercase tracking-wider text-[11px] text-[#351027]">
                  Profile Photo (Upload file or enter URL)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="relative flex-shrink-0">
                    {avatarPreview && (avatarPreview.startsWith('data:image') || avatarPreview.startsWith('http')) ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-[3.5px] border-[#351027] shadow-tactile bg-white flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFE8ED] border-[3.5px] border-[#351027] flex items-center justify-center font-display font-black text-3xl text-[#F52F4F] shadow-tactile flex-shrink-0">
                        {avatarPreview || editingMember.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2 flex-1 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-tactile btn-tactile-pink"
                      >
                        <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          Upload & Crop Photo
                        </span>
                      </button>

                      {avatarPreview && (avatarPreview.startsWith('data:image') || avatarPreview.startsWith('http')) && (
                        <button
                          type="button"
                          onClick={() => {
                            setRawImageForCrop(avatarPreview);
                            setCropperOpen(true);
                          }}
                          className="btn-tactile btn-tactile-gold"
                        >
                          <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1.5">
                            <Crop className="w-3.5 h-3.5" />
                            Crop & Resize
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const initials = editingMember.name.split(' ').map((n) => n[0]).join('');
                          setAvatarPreview(initials);
                          setEditForm((prev) => ({ ...prev, avatar: initials }));
                        }}
                        className="btn-tactile btn-tactile-white"
                      >
                        <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold">
                          Reset to Initials
                        </span>
                      </button>
                    </div>

                    <div className="text-[10px] text-[#351027]/60 font-medium">
                      Or paste an online image URL:
                    </div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={avatarPreview.startsWith('data:image') ? '' : avatarPreview}
                      onChange={(e) => {
                        setAvatarPreview(e.target.value);
                        setEditForm((prev) => ({ ...prev, avatar: e.target.value }));
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#351027] bg-[#FFF8E8] text-[11px] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Name and Role */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Assigned Role *</label>
                  <input
                    type="text"
                    required
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Focus / Bio Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={editForm.focus}
                    onChange={(e) => setEditForm({ ...editForm, focus: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">
                    Skills (Comma-separated tags)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, PyTorch, TypeScript, UI/UX"
                    value={editForm.skills}
                    onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={editForm.github_url}
                    onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={editForm.linkedin_url}
                    onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white text-xs font-bold text-[#351027]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#351027]/10">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
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
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Profile & Photo
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Interactive Image Cropper & Resizer Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        title={`Crop & Resize Photo for ${editingMember?.name || 'Team Member'}`}
      />
    </div>
  );
}
