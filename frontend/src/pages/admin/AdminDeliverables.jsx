import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { Plus, Check, Upload as UploadIcon, Trash2 } from 'lucide-react';

export default function AdminDeliverables() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { show, ToastContainer } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', version: '1.0', type: 'planning', date: '', authors: '', description: '' });
  const [file, setFile] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-deliverables'],
    queryFn: () => apiRequest('/api/deliverables', {}, session), // Note: Currently this endpoint only returns published. Admin should probably see drafts, but for now we follow the existing controller.
  });

  const publishMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/deliverables/${id}/publish`, { method: 'PATCH' }, session),
    onSuccess: () => {
      qc.invalidateQueries(['admin-deliverables']);
      show('Deliverable published', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/deliverables/${id}`, { method: 'DELETE' }, session),
    onSuccess: () => {
      qc.invalidateQueries(['admin-deliverables']);
      show('Deliverable deleted', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let fileAssetId = null;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/upload/deliverable`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData?.error?.message || 'Upload failed');
        fileAssetId = uploadData.data.id;
      }

      const body = {
        title: form.title,
        version: form.version,
        type: form.type,
        date: form.date,
        authors: form.authors.split(',').map(s => s.trim()).filter(Boolean),
        description: form.description,
        file_asset_id: fileAssetId,
      };

      return apiRequest('/api/deliverables', {
        method: 'POST',
        body: JSON.stringify(body),
      }, session);
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-deliverables']);
      setShowAdd(false);
      setForm({ title: '', version: '1.0', type: 'planning', date: '', authors: '', description: '' });
      setFile(null);
      show('Deliverable created successfully', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliverables</h1>
          <p className="page-subtitle">Manage project presentations and reports.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Deliverable
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Title &amp; Version</th>
              <th>Type</th>
              <th>Date</th>
              <th>Authors</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => (
              <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full rounded" /></td></tr>
            ))}
            {!isLoading && error && <tr><td colSpan={6}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && (data?.data || []).length === 0 && (
              <tr><td colSpan={6}><EmptyState title="No deliverables found" /></td></tr>
            )}
            {!isLoading && !error && (data?.data || []).map(del => (
              <tr key={del.id}>
                <td>
                  <p className="font-medium">{del.title}</p>
                  <p className="text-xs text-surface-500">v{del.version}</p>
                </td>
                <td><span className="capitalize">{del.type}</span></td>
                <td>{new Date(del.date).toLocaleDateString()}</td>
                <td className="text-sm truncate max-w-[150px]">{del.authors.join(', ')}</td>
                <td><StatusBadge status={del.status} /></td>
                <td>
                  <div className="flex items-center gap-2">
                    {del.status === 'draft' && (
                      <button onClick={() => publishMutation.mutate(del.id)} disabled={publishMutation.isPending} className="btn-secondary btn-sm text-success-dark">
                        <Check className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(del.id); }} className="btn-ghost btn-sm text-danger">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Deliverable">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Title</label>
            <input required className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Version</label>
              <input required className="form-input" value={form.version} onChange={e => setForm({...form, version: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="planning">Planning</option>
                <option value="demo">Demo</option>
                <option value="final">Final</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date</label>
              <input required type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Authors (comma separated)</label>
              <input required className="form-input" value={form.authors} onChange={e => setForm({...form, authors: e.target.value})} placeholder="Alice, Bob" />
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Attachment (PDF/PPTX)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="form-input" accept=".pdf,.ppt,.pptx" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Saving...' : 'Create Draft'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
