import { CheckCircle2, Circle, ClipboardCheck, FileText, Users, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function RoadmapPage() {
  const { sections, loading, updateSection } = useEditableContent('roadmap');
  const phases = sections.phases || [];
  const commitments = sections.commitments || [];
  const guidance = sections.guidance || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  const commitmentIcons = [Users, ClipboardCheck, FileText];

  return (
    <div className="page-container">
      <h1 className="page-title">Revised Scope & Roadmap</h1>
      <p className="page-subtitle">A staged plan focused first on reliable, doctor-adaptive handwriting recognition.</p>

      <div className="max-w-4xl space-y-10">
        <EditableSection
          title="Commitment for the Next Stage"
          items={commitments}
          fields={[
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
          onSave={(items) => updateSection('commitments', items)}
          className="animate-in"
        >
          <div className="grid sm:grid-cols-3 gap-3">
            {commitments.map((item: any, i: number) => {
              const Icon = commitmentIcons[i] || FileText;
              return (
                <div key={i} className="card p-4">
                  <Icon className="w-4 h-4 text-primary-500 mb-3" />
                  <h3 className="text-sm font-medium text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </EditableSection>

        <EditableSection
          title="Delivery Plan"
          items={phases}
          fields={[
            { key: 'title', label: 'Phase Title', type: 'text' },
            { key: 'detail', label: 'Description', type: 'textarea' },
            { key: 'status', label: 'Status', type: 'select', options: ['now', 'next', 'planned', 'done'] },
          ]}
          onSave={(items) => updateSection('phases', items)}
          className="animate-in-delay-1"
        >
          <div className="card divide-y divide-slate-100">
            {phases.map((phase: any, index: number) => (
              <div key={index} className="px-5 py-4 flex gap-4">
                {phase.status === 'now' || phase.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-800">{phase.title}</h3>
                    {phase.status === 'now' && <span className="badge-green">Current focus</span>}
                    {phase.status === 'done' && <span className="badge-green">Done</span>}
                    {phase.status === 'next' && <span className="badge-yellow">Up next</span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{phase.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </EditableSection>

        <EditableSection
          title="Guidance Needed"
          items={guidance}
          fields={[{ key: 'value', label: 'Guidance item', type: 'textarea' }]}
          onSave={(items) => updateSection('guidance', items)}
          className="animate-in-delay-2"
        >
          <div className="card p-5">
            <ul className="space-y-2.5 text-sm text-slate-600">
              {guidance.map((item: any, i: number) => (
                <li key={i}>{item.value}</li>
              ))}
            </ul>
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
