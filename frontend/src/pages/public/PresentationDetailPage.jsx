import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import { ArrowLeft, Download, FileText, Calendar, Users } from 'lucide-react';
import { useState } from 'react';

export default function PresentationDetailPage() {
  const { id } = useParams();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['deliverable', id],
    queryFn: () => apiRequest(`/api/deliverables/${id}`, {}, null),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const del = data?.data;
  if (!del) return <EmptyState title="Presentation not found" />;

  const asset = del.file_assets;

  async function handleDownload() {
    if (!asset?.id) return;
    setDownloading(true);
    setDownloadError('');
    try {
      // Need signed URL for download even if it's public conceptually (or if backend enforces signed URL for all)
      // Note: files controller /api/files/signed/:id is auth protected if private, but public if visibility=public
      const res = await apiRequest(`/api/files/signed/${asset.id}`, {}, null);
      if (res?.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/presentations" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" /> Back to presentations
      </Link>

      <div className="card">
        <div className="card-header flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-surface-900">{del.title}</h1>
              <span className="font-mono text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded">v{del.version}</span>
            </div>
            <div className="flex items-center flex-wrap gap-4 text-sm text-surface-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(del.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {del.authors.join(', ')}</span>
              <StatusBadge status={del.type} />
            </div>
          </div>
        </div>

        <div className="card-body">
          <h3 className="font-semibold text-surface-900 mb-2">Description</h3>
          <p className="text-surface-600 text-sm leading-relaxed whitespace-pre-wrap mb-8">
            {del.description || 'No description provided.'}
          </p>

          <h3 className="font-semibold text-surface-900 mb-4">Attached File</h3>
          {asset ? (
            <div className="flex items-center justify-between p-4 bg-surface-50 border border-surface-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-brand-600" />
                <div>
                  <p className="font-medium text-surface-900">{asset.original_name}</p>
                  <p className="text-xs text-surface-500 uppercase">{asset.mime_type.split('/').pop()} • {(asset.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary"
              >
                {downloading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Getting Link…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="alert-info">No file attached to this deliverable.</div>
          )}
          
          {downloadError && (
            <p className="text-danger text-sm mt-2">{downloadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
