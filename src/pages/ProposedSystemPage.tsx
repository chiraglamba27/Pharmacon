import { ArrowDown, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function ProposedSystemPage() {
  const { sections, loading, updateSection } = useEditableContent('proposed-system');
  const manualSteps = sections.manual_steps || [];
  const proposedSteps = sections.proposed_steps || [];
  const architecture = sections.architecture || [];
  const portals = sections.portals || [];
  const crossCutting = sections.cross_cutting || [];
  const modularCards = sections.modular_cards || [];
  const improvementNote = sections.improvement_note || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Proposed System</h1>
      <p className="page-subtitle">Workflow comparison, architecture and system components.</p>

      <div className="max-w-5xl space-y-12">
        {/* Workflow Comparison */}
        <section className="animate-in">
          <h2 className="section-heading">What We Plan to Do Better</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manual */}
            <EditableSection
              headless
              items={manualSteps}
              fields={[{ key: 'value', label: 'Step', type: 'text' }]}
              onSave={(items) => updateSection('manual_steps', items)}
            >
              <div className="card p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Current / Manual Workflow</div>
                <div className="space-y-0">
                  {manualSteps.map((step: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 py-2 px-3 rounded bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500">{i + 1}</span>
                        <span className="text-sm text-slate-600">{step.value}</span>
                      </div>
                      {i < manualSteps.length - 1 && (
                        <div className="flex justify-center py-1 text-slate-300">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>

            {/* Proposed */}
            <EditableSection
              headless
              items={proposedSteps}
              fields={[{ key: 'value', label: 'Step', type: 'text' }]}
              onSave={(items) => updateSection('proposed_steps', items)}
            >
              <div className="card p-5 border-primary-200 bg-primary-50/30">
                <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-4">Proposed Pharmacon Workflow</div>
                <div className="space-y-0">
                  {proposedSteps.map((step: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-3 py-2 px-3 rounded bg-white border border-primary-100">
                        <span className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-600">{i + 1}</span>
                        <span className="text-sm text-slate-700 font-medium">{step.value}</span>
                      </div>
                      {i < proposedSteps.length - 1 && (
                        <div className="flex justify-center py-1 text-primary-300">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          </div>

          <EditableSection
            headless
            items={improvementNote}
            fields={[{ key: 'text', label: 'Note', type: 'textarea' }]}
            onSave={(items) => updateSection('improvement_note', items)}
          >
            <div className="card p-4 mt-4 bg-slate-50">
              {improvementNote.map((item: any, i: number) => (
                <p key={i} className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </div>
          </EditableSection>
        </section>

        {/* Architecture */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Proposed System Architecture</h2>
          <div className="card p-6">
            {/* Main pipeline */}
            <EditableSection
              headless
              items={architecture}
              fields={[{ key: 'label', label: 'Component', type: 'text' }]}
              onSave={(items) => updateSection('architecture', items)}
            >
              <div className="max-w-sm mx-auto mb-6">
                {architecture.map((comp: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 py-2 px-4 rounded-md bg-slate-50 border border-slate-200">
                      <span className="text-sm font-medium text-slate-700">{comp.label}</span>
                    </div>
                    {i < architecture.length - 1 && (
                      <div className="flex justify-center py-1 text-slate-300">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </EditableSection>

            {/* Portals */}
            <EditableSection
              headless
              items={portals}
              fields={[{ key: 'value', label: 'Portal', type: 'text' }]}
              onSave={(items) => updateSection('portals', items)}
            >
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                {portals.map((portal: any, i: number) => (
                  <div key={i} className="py-2 px-3 rounded-md bg-primary-50 border border-primary-200 text-center">
                    <span className="text-xs font-medium text-primary-700">{portal.value}</span>
                  </div>
                ))}
              </div>
            </EditableSection>

            {/* Cross-cutting */}
            <EditableSection
              headless
              items={crossCutting}
              fields={[{ key: 'value', label: 'Concern', type: 'text' }]}
              onSave={(items) => updateSection('cross_cutting', items)}
            >
              <div className="border-t border-slate-100 pt-4">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Cross-Cutting Concerns</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {crossCutting.map((item: any, i: number) => (
                    <span key={i} className="badge-slate">{item.value}</span>
                  ))}
                </div>
              </div>
            </EditableSection>
          </div>

          <EditableSection
            headless
            items={modularCards}
            fields={[
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'desc', label: 'Description', type: 'textarea' },
            ]}
            onSave={(items) => updateSection('modular_cards', items)}
          >
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {modularCards.map((item: any, i: number) => (
                <div key={i} className="card p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.title}</div>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </EditableSection>
        </section>
      </div>
    </div>
  );
}
