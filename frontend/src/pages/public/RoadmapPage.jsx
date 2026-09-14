import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';

export default function RoadmapPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => apiRequest('/api/project/roadmap', {}, null),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const milestones = data?.data || [];
  if (milestones.length === 0) return <EmptyState title="No milestones found" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-2">Project Roadmap</h1>
      <p className="text-surface-600 mb-8">Timeline and milestones for the Pharmacon project.</p>

      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="card card-body flex gap-6 items-start relative">
            <div className="flex flex-col items-center mt-1">
              <div className={`w-4 h-4 rounded-full ${milestone.status === 'completed' ? 'bg-success' : milestone.status === 'in_progress' ? 'bg-info' : 'bg-surface-300'}`} />
              {index !== milestones.length - 1 && <div className="w-0.5 h-full bg-surface-200 mt-2 min-h-[3rem]" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <h3 className="text-lg font-semibold text-surface-900">{milestone.title}</h3>
                <StatusBadge status={milestone.status} />
              </div>
              <p className="text-surface-600 text-sm mb-2">{milestone.description}</p>
              <p className="text-surface-400 text-xs font-mono">Target Date: {milestone.target_date ? new Date(milestone.target_date).toLocaleDateString() : 'TBD'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
