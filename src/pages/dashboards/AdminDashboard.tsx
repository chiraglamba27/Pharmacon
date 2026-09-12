import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import FileUploader from '../../components/FileUploader';
import {
  Users, Activity, Package, Settings, Shield, AlertTriangle, Loader2,
  FileText, Download, Trash2, Eye, Plus, X, Upload, File, Image, FolderOpen
} from 'lucide-react';

interface UploadedFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
  file_url?: string;
}

interface DeliverableEntry {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  file_name: string | null;
  version_name: string | null;
}

interface VersionEntry {
  id: string;
  name: string;
  status: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('presentation')) return FileText;
  return File;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableEntry[]>([]);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'deliverables' | 'upload'>('files');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Deliverable creation form
  const [showCreateDeliverable, setShowCreateDeliverable] = useState(false);
  const [delivForm, setDelivForm] = useState({
    title: '', type: 'Report', date: '', status: 'draft', description: '', versionId: '', fileId: '',
  });
  const [creatingDeliverable, setCreatingDeliverable] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [filesRes, delivRes, versRes] = await Promise.all([
        api.get<{ files: UploadedFile[] }>('/files'),
        api.get<{ deliverables: DeliverableEntry[] }>('/deliverables'),
        api.get<{ versions: VersionEntry[] }>('/versions'),
      ]);
      setFiles(filesRes.files);
      setDeliverables(delivRes.deliverables);
      setVersions(versRes.versions);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleUploadComplete = () => {
    loadData();
    setActiveTab('files');
  };

  const deleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    setDeleting(id);
    try {
      await api.delete(`/files/${id}`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
    setDeleting(null);
  };

  const createDeliverable = async () => {
    setCreatingDeliverable(true);
    try {
      await api.post('/deliverables', delivForm);
      await loadData();
      setShowCreateDeliverable(false);
      setDelivForm({ title: '', type: 'Report', date: '', status: 'draft', description: '', versionId: '', fileId: '' });
    } catch (err: any) {
      alert(err.message);
    }
    setCreatingDeliverable(false);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Portal</h1>
      <p className="page-subtitle">
        {isAdmin
          ? 'Upload files, manage deliverables, and control versioning.'
          : 'View uploaded files and deliverables. Admin access required for editing.'}
      </p>

      <div className="max-w-5xl space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in">
          <div className="stat-card">
            <div className="stat-value">{files.length}</div>
            <div className="stat-label">Uploaded Files</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{deliverables.length}</div>
            <div className="stat-label">Deliverables</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{versions.length}</div>
            <div className="stat-label">Versions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
            </div>
            <div className="stat-label">Total Storage</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 animate-in-delay-1">
          {[
            { key: 'files' as const, label: 'Files', icon: FolderOpen },
            ...(isAdmin ? [{ key: 'upload' as const, label: 'Upload', icon: Upload }] : []),
            { key: 'deliverables' as const, label: 'Deliverables', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                ${activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {activeTab === 'upload' && isAdmin && (
          <section className="animate-in">
            <h2 className="section-heading">Upload Files</h2>
            <p className="text-sm text-slate-500 mb-4">
              Drag and drop PPTs, PDFs, images, or ZIP files. All uploads are stored on the server.
            </p>
            <FileUploader
              onUploadComplete={handleUploadComplete}
            />
          </section>
        )}

        {/* Files tab */}
        {activeTab === 'files' && (
          <section className="animate-in">
            <h2 className="section-heading">All Files ({files.length})</h2>
            {files.length === 0 ? (
              <div className="card p-8 text-center">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No files uploaded yet.</p>
                {isAdmin && (
                  <button onClick={() => setActiveTab('upload')} className="btn-primary mt-4 gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </button>
                )}
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="table-header">File</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Size</th>
                      <th className="table-header">Uploaded By</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map((file) => {
                      const Icon = getFileTypeIcon(file.mime_type);
                      return (
                        <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px]" title={file.original_name}>
                                {file.original_name}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="badge-slate text-[10px]">
                              {file.mime_type.split('/').pop()?.toUpperCase()}
                            </span>
                          </td>
                          <td className="table-cell font-mono text-xs">{formatFileSize(file.size)}</td>
                          <td className="table-cell">{file.uploader_name || '—'}</td>
                          <td className="table-cell text-xs">{new Date(file.created_at).toLocaleDateString()}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <a
                                href={file.file_url || `#`}
                                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              {isAdmin && (
                                <button
                                  onClick={() => deleteFile(file.id)}
                                  disabled={deleting === file.id}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50 disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deleting === file.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Deliverables tab */}
        {activeTab === 'deliverables' && (
          <section className="animate-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading mb-0">Deliverables ({deliverables.length})</h2>
              {isAdmin && (
                <button onClick={() => setShowCreateDeliverable(!showCreateDeliverable)} className="btn-secondary gap-2 text-xs">
                  {showCreateDeliverable ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showCreateDeliverable ? 'Cancel' : 'New Deliverable'}
                </button>
              )}
            </div>

            {/* Create deliverable form */}
            {showCreateDeliverable && (
              <div className="card p-5 space-y-4 mb-6 animate-in">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Title</label>
                    <input type="text" className="input" placeholder="Deliverable title" value={delivForm.title} onChange={e => setDelivForm({...delivForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="select" value={delivForm.type} onChange={e => setDelivForm({...delivForm, type: e.target.value})}>
                      <option>Report</option>
                      <option>Slides</option>
                      <option>Demo</option>
                      <option>Spreadsheet</option>
                      <option>Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" className="input" value={delivForm.date} onChange={e => setDelivForm({...delivForm, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="select" value={delivForm.status} onChange={e => setDelivForm({...delivForm, status: e.target.value})}>
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Version</label>
                    <select className="select" value={delivForm.versionId} onChange={e => setDelivForm({...delivForm, versionId: e.target.value})}>
                      <option value="">None</option>
                      {versions.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Attached File</label>
                    <select className="select" value={delivForm.fileId} onChange={e => setDelivForm({...delivForm, fileId: e.target.value})}>
                      <option value="">None</option>
                      {files.map(f => (
                        <option key={f.id} value={f.id}>{f.original_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} placeholder="Describe this deliverable..." value={delivForm.description} onChange={e => setDelivForm({...delivForm, description: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreateDeliverable(false)} className="btn-secondary">Cancel</button>
                  <button onClick={createDeliverable} disabled={creatingDeliverable || !delivForm.title || !delivForm.date} className="btn-primary gap-2">
                    {creatingDeliverable ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creatingDeliverable ? 'Creating...' : 'Create Deliverable'}
                  </button>
                </div>
              </div>
            )}

            {/* Deliverables list */}
            <div className="space-y-2">
              {deliverables.map((d) => (
                <Link
                  key={d.id}
                  to={`/deliverable/${d.id}`}
                  className="card-hover p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-700">{d.title}</div>
                      <div className="text-xs text-slate-500">
                        {d.type} · {d.date}
                        {d.version_name && ` · ${d.version_name}`}
                        {d.file_name && ` · 📎 ${d.file_name}`}
                      </div>
                    </div>
                  </div>
                  <span className={
                    d.status === 'published' ? 'badge-green' :
                    d.status === 'in-progress' ? 'badge-yellow' : 'badge-slate'
                  }>
                    {d.status === 'in-progress' ? 'In Progress' : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
