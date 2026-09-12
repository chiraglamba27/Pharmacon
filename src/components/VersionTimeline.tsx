import { GitBranch, Circle, CheckCircle2, Clock, Archive } from 'lucide-react';

interface VersionNode {
  id: string;
  name: string;
  date: string;
  status: string;
  change_summary: string;
  authors: string;
  commit_ref?: string;
  deployment_url?: string;
}

interface VersionTimelineProps {
  versions: VersionNode[];
  onSelect?: (version: VersionNode) => void;
  selectedId?: string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'current': return CheckCircle2;
    case 'archived': return Archive;
    case 'future': return Clock;
    default: return Circle;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'current': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', line: 'border-emerald-300' };
    case 'archived': return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400', line: 'border-slate-300' };
    case 'future': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400', line: 'border-blue-200' };
    default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400', line: 'border-slate-200' };
  }
}

export default function VersionTimeline({ versions, onSelect, selectedId }: VersionTimelineProps) {
  return (
    <div className="relative">
      {versions.map((version, i) => {
        const colors = getStatusColor(version.status);
        const StatusIcon = getStatusIcon(version.status);
        const isLast = i === versions.length - 1;
        const isSelected = version.id === selectedId;

        return (
          <div key={version.id} className="relative flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-200
                ${isSelected ? 'ring-2 ring-primary-400 ring-offset-2' : ''}
                ${colors.bg} border ${colors.border}
              `}>
                <StatusIcon className={`w-4 h-4 ${colors.text}`} />
              </div>
              {!isLast && (
                <div className={`w-px flex-1 min-h-[2rem] border-l-2 border-dashed ${colors.line}`} />
              )}
            </div>

            {/* Content */}
            <div
              className={`
                flex-1 pb-6 cursor-pointer group
                ${isLast ? '' : ''}
              `}
              onClick={() => onSelect?.(version)}
            >
              <div className={`
                card p-4 transition-all duration-200
                ${isSelected ? 'ring-2 ring-primary-200 border-primary-300 shadow-card-hover' : 'group-hover:shadow-card-hover'}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-800">{version.name}</h3>
                  </div>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${version.status === 'current' ? 'bg-emerald-50 text-emerald-700' :
                      version.status === 'archived' ? 'bg-slate-100 text-slate-600' :
                      'bg-blue-50 text-blue-700'}
                  `}>
                    {version.status === 'current' ? 'Current' :
                     version.status === 'archived' ? 'Archived' :
                     version.status === 'future' ? 'Planned' : version.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-slate-400">Date:</span>{' '}
                    <span className="text-slate-600">{version.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Authors:</span>{' '}
                    <span className="text-slate-600">{version.authors}</span>
                  </div>
                </div>

                {version.change_summary && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {version.change_summary}
                  </p>
                )}

                {(version.commit_ref || version.deployment_url) && (
                  <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
                    {version.commit_ref && (
                      <a
                        href={version.commit_ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Commit
                      </a>
                    )}
                    {version.deployment_url && (
                      <a
                        href={version.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Deployment
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
