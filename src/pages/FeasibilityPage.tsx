import { Info, Shield, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function FeasibilityPage() {
  const { sections, loading, updateSection } = useEditableContent('feasibility');
  const techFeasibility = sections.tech_feasibility || [];
  const dataFeasibility = sections.data_feasibility || [];
  const risks = sections.risks || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'badge-red';
      case 'medium': return 'badge-yellow';
      case 'low': return 'badge-green';
      default: return 'badge-slate';
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Feasibility & Risk</h1>
      <p className="page-subtitle">Technical feasibility assessment and risk register.</p>

      <div className="max-w-4xl space-y-10">
        {/* Technical Feasibility */}
        <EditableSection
          title="Technical Feasibility"
          items={techFeasibility}
          fields={[
            { key: 'area', label: 'Area', type: 'text' },
            { key: 'status', label: 'Status', type: 'select', options: ['feasible', 'research'] },
            { key: 'note', label: 'Note', type: 'text' },
          ]}
          onSave={(items) => updateSection('tech_feasibility', items)}
          className="animate-in"
        >
          <div className="card divide-y divide-slate-100">
            {techFeasibility.map((item: any, i: number) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{item.area}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.note}</div>
                </div>
                <span className={item.status === 'feasible' ? 'badge-green' : 'badge-yellow'}>
                  {item.status === 'feasible' ? 'Feasible' : 'Requires Research'}
                </span>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* Data Feasibility */}
        <EditableSection
          title="Data Feasibility"
          items={dataFeasibility}
          fields={[{ key: 'text', label: 'Content', type: 'textarea' }]}
          onSave={(items) => updateSection('data_feasibility', items)}
          className="animate-in-delay-1"
        >
          <div className="card p-5">
            <div className="flex gap-3 items-start">
              <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                {dataFeasibility.map((item: any, i: number) => (
                  <p key={i} className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                ))}
              </div>
            </div>
          </div>
        </EditableSection>

        {/* Risk Register */}
        <EditableSection
          title="Risk Register"
          items={risks}
          fields={[
            { key: 'id', label: 'ID', type: 'text' },
            { key: 'risk', label: 'Risk', type: 'text' },
            { key: 'impact', label: 'Impact', type: 'select', options: ['high', 'medium', 'low'] },
            { key: 'mitigation', label: 'Mitigation', type: 'textarea' },
            { key: 'fallback', label: 'Fallback', type: 'textarea' },
          ]}
          onSave={(items) => updateSection('risks', items)}
          className="animate-in-delay-2"
        >
          <div className="space-y-3">
            {risks.map((risk: any) => (
              <div key={risk.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{risk.id}</span>
                    <span className="text-sm font-medium text-slate-800">{risk.risk}</span>
                  </div>
                  <span className={impactColor(risk.impact)}>
                    {risk.impact} impact
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Mitigation</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{risk.mitigation}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Fallback</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{risk.fallback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* Safety Boundary */}
        <section className="animate-in-delay-3">
          <div className="card p-5 border-slate-300 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Safety Boundary</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pharmacon is intended to digitise and connect confirmed prescriptions. It does not diagnose conditions,
              recommend medicines, substitute medicines, change dosages, or override professional clinical judgement.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
