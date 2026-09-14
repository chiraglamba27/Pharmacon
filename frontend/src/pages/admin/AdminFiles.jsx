import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { ErrorState, EmptyState } from '../../components/States';
import { useToast } from '../../components/Toast';
import { Link2, Trash2, Shield, Globe } from 'lucide-react';

export default function AdminFiles() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { show, ToastContainer } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-files'],
    queryFn: () => apiRequest('/api/files', {}, session),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/files/${id}`, { method: 'DELETE' }, session),
    onSuccess: () => {
      qc.invalidateQueries(['admin-files']);
      show('File deleted', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  async function handleGetLink(fileId) {
    try {
      const res = await apiRequest(`/api/files/signed/${fileId}`, {}, session);
      if (res?.data?.url) {
        await navigator.clipboard.writeText(res.data.url);
        show('Signed URL copied to clipboard (valid for 5 mins)', 'success');
      }
    } catch (err) {
      show('Failed to get link: ' + err.message, 'error');
    }
  }

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div>
          <h1 className="page-title">File Assets</h1>
          <p className="page-subtitle">Raw file storage management.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Bucket</th>
              <th>Visibility</th>
              <th>Size</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={6}><div className="skeleton h-4 w-full rounded" /></td></tr>)}
            {!isLoading && error && <tr><td colSpan={6}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && (data?.data || []).length === 0 && (
              <tr><td colSpan={6}><EmptyState title="No files uploaded" /></td></tr>
            )}
            {!isLoading && !error && (data?.data || []).map(file => (
              <tr key={file.id}>
                <td>
                  <p className="font-medium truncate max-w-[200px]" title={file.original_name}>{file.original_name}</p>
                  <p className="text-xs text-surface-500 font-mono">{file.mime_type}</p>
                </td>
                <td className="text-sm font-mono text-surface-500">{file.bucket}</td>
                <td>
                  <span className={`badge ${file.visibility === 'public' ? 'badge-green' : 'badge-gray'} flex items-center gap-1 w-fit`}>
                    {file.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {file.visibility}
                  </span>
                </td>
                <td className="text-sm">{(file.size / 1024).toFixed(1)} KB</td>
                <td className="text-xs">{new Date(file.created_at).toLocaleString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleGetLink(file.id)} className="btn-secondary btn-sm" title="Copy Link">
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if(confirm('Delete file permanently? This may break references.')) deleteMutation.mutate(file.id); }} className="btn-ghost btn-sm text-danger" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
