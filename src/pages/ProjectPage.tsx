import { Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function ProjectPage() {
  const { sections, loading, updateSection } = useEditableContent('project');
  const overview = sections.overview || [];
  const direction = sections.direction || [];
  const why = sections.why || [];
  const coreIdea = sections.core_idea || [];
  const users = sections.users || [];
  const engineering = sections.engineering || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="prototype-banner mb-4">
        <Info className="w-3.5 h-3.5" />
        <span>Current Direction · Under Evaluation</span>
      </div>
      <h1 className="page-title">Project Overview</h1>
      <p className="page-subtitle">Understanding the Pharmacon concept and current engineering direction.</p>

      <div className="space-y-8 max-w-3xl">
        {/* Overview */}
        <EditableSection
          title="What is Pharmacon?"
          items={overview}
          fields={[{ key: 'text', label: 'Paragraph', type: 'textarea' }]}
          onSave={(items) => updateSection('overview', items)}
          className="animate-in"
        >
          <div className="card p-5 space-y-3">
            {overview.map((p: any, i: number) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>
        </EditableSection>

        {/* Current Direction */}
        <EditableSection
          title="Current Direction"
          items={direction}
          fields={[{ key: 'value', label: 'Direction item', type: 'text' }]}
          onSave={(items) => updateSection('direction', items)}
          className="animate-in-delay-1"
        >
          <div className="card p-5">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Based on our professor's guidance, we are currently exploring the following areas:
            </p>
            <ul className="space-y-2.5">
              {direction.map((item: any, i: number) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {item.value}
                </li>
              ))}
            </ul>
          </div>
        </EditableSection>

        {/* Scope Notice */}
        <section className="animate-in-delay-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Scope Under Evaluation</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                The exact final scope of Pharmacon is still being evaluated by our team. The information
                presented here reflects our current direction, which may be refined as we progress.
                No production deployment or clinical validation is claimed.
              </p>
            </div>
          </div>
        </section>

        {/* Why */}
        <EditableSection
          title="Why We Are Building It"
          items={why}
          fields={[{ key: 'text', label: 'Paragraph', type: 'textarea' }]}
          onSave={(items) => updateSection('why', items)}
          className="animate-in-delay-3"
        >
          <div className="card p-5 space-y-3">
            {why.map((p: any, i: number) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">{p.text}</p>
            ))}
          </div>
        </EditableSection>

        {/* Core Idea */}
        <EditableSection
          title="Core Idea"
          items={coreIdea}
          fields={[{ key: 'text', label: 'Quote', type: 'textarea' }]}
          onSave={(items) => updateSection('core_idea', items)}
        >
          <div className="card p-5">
            {coreIdea.map((p: any, i: number) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed italic">{p.text}</p>
            ))}
          </div>
        </EditableSection>

        {/* Users */}
        <EditableSection
          title="Proposed Users"
          items={users}
          fields={[
            { key: 'user', label: 'User Type', type: 'text' },
            { key: 'desc', label: 'Description', type: 'text' },
          ]}
          onSave={(items) => updateSection('users', items)}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {users.map((item: any, i: number) => (
              <div key={i} className="card p-4">
                <div className="text-sm font-medium text-slate-800 mb-1">{item.user}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* Engineering Work */}
        <EditableSection
          title="Expected Engineering Work"
          items={engineering}
          fields={[
            { key: 'area', label: 'Area', type: 'text' },
            { key: 'desc', label: 'Description', type: 'text' },
          ]}
          onSave={(items) => updateSection('engineering', items)}
        >
          <div className="card divide-y divide-slate-100">
            {engineering.map((item: any, i: number) => (
              <div key={i} className="px-5 py-3 flex gap-4">
                <span className="text-sm font-medium text-slate-700 w-24 flex-shrink-0">{item.area}</span>
                <span className="text-sm text-slate-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
