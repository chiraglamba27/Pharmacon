import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';
import { FileText, Download, Calendar } from 'lucide-react';

export default function PresentationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => apiRequest('/api/deliverables', {}, null),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const deliverables = data?.data || [];
  if (deliverables.length === 0) return <EmptyState title="No presentations found" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-2">Presentations &amp; Deliverables</h1>
      <p className="text-surface-600 mb-8">Official project documents, slide decks, and reports.</p>

      <div className="grid gap-4">
        {deliverables.map(del => (
          <Link key={del.id} to={`/presentations/${del.id}`} className="card hover:border-brand-300 hover:shadow-md transition-all no-underline block">
            <div className="card-body sm:flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900">{del.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-surface-500 mt-0.5">
                      <span className="font-mono text-xs bg-surface-100 px-1.5 py-0.5 rounded">v{del.version}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(del.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-surface-600 text-sm mt-3 line-clamp-2">{del.description}</p>
                <p className="text-xs text-surface-400 mt-2">Authors: {del.authors.join(', ')}</p>
              </div>

              <div className="mt-4 sm:mt-0 flex flex-col items-end gap-3">
                <StatusBadge status={del.type} />
                <span className="text-brand-600 text-sm font-medium flex items-center gap-1 group-hover:underline">
                  View Details
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
