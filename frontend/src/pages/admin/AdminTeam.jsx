import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { ErrorState, EmptyState } from '../../components/States';

export default function AdminTeam() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => apiRequest('/api/project/team', {}, null),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">Manage project team details.</p>
        </div>
      </div>

      <div className="alert-warning mb-6">
        <p className="text-sm">Team management mutation endpoints (POST/PUT/DELETE) are currently stubbed on the backend. This page is read-only for now.</p>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Focus</th>
              <th>Order</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [1,2,3].map(i => <tr key={i}><td colSpan={4}><div className="skeleton h-4 w-full rounded" /></td></tr>)}
            {!isLoading && error && <tr><td colSpan={4}><ErrorState message={error.message} /></td></tr>}
            {!isLoading && !error && (data?.data || []).length === 0 && (
              <tr><td colSpan={4}><EmptyState title="No team members found" /></td></tr>
            )}
            {!isLoading && !error && (data?.data || []).map(member => (
              <tr key={member.id}>
                <td className="font-medium">{member.name}</td>
                <td>{member.role}</td>
                <td className="text-sm">{member.technical_focus}</td>
                <td className="font-mono text-sm">{member.display_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
