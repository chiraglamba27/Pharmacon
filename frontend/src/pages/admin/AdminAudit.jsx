import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { ErrorState } from '../../components/States';

export default function AdminAudit() {
  const { session } = useAuth();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit', page, actionFilter, entityFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit });
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entity_type', entityFilter);
      return apiRequest(`/api/audit?${params.toString()}`, {}, session);
    },
    keepPreviousData: true,
  });

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Immutable record of system actions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          className="form-input max-w-xs"
          placeholder="Filter by action (e.g. DISPENSE)"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value.toUpperCase())}
        />
        <input
          type="text"
          className="form-input max-w-xs"
          placeholder="Filter by entity type (e.g. medicine)"
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value.toLowerCase())}
        />
      </div>

      <div className="table-wrapper mb-4">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3,4,5].map(i => <tr key={i}><td colSpan={5}><div className="skeleton h-4 w-full rounded" /></td></tr>)}
            {!isLoading && error && <tr><td colSpan={5}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && logs.map(log => (
              <tr key={log.id}>
                <td className="text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="text-sm font-medium">{log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'System'}</td>
                <td><span className="badge badge-gray font-mono">{log.action}</span></td>
                <td className="text-sm text-surface-500">
                  {log.entity_type} <br/>
                  <span className="text-xs font-mono">{log.entity_id}</span>
                </td>
                <td className="text-xs font-mono text-surface-500 break-all max-w-[200px]">
                  {JSON.stringify(log.metadata)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-surface-500">
        <div>Showing page {page} of {totalPages || 1} ({total} total logs)</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary btn-sm"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages || totalPages === 0}
            className="btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
