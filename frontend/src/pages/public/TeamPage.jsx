import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';

export default function TeamPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: () => apiRequest('/api/project/team', {}, null),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const team = data?.data || [];
  if (team.length === 0) return <EmptyState title="No team members found" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-2">The Team</h1>
      <p className="text-surface-600 mb-8">Meet the people building Pharmacon.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map(member => {
          const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2);
          return (
            <div key={member.id} className="card card-body text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-brand-700 font-bold text-lg">{initials}</span>
              </div>
              <h3 className="font-semibold text-surface-900">{member.name}</h3>
              <p className="text-sm font-medium text-brand-600 mt-1">{member.role}</p>
              
              <div className="mt-4 text-left w-full text-sm">
                <p className="text-surface-500 mb-2"><strong>Focus:</strong> {member.technical_focus}</p>
                <p className="text-surface-500"><strong>Responsibilities:</strong> {member.responsibilities}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
