import { ArrowDown, Info, User, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function DoctorAdaptationPage() {
  const { sections, loading, updateSection } = useEditableContent('doctor-adaptation');
  const doctorProfile = sections.doctor_profile || [];
  const calibrationCategories = sections.calibration_categories || [];
  const adaptationSteps = sections.adaptation_steps || [];
  const explanation = sections.explanation || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  const profile = doctorProfile[0] || { name: 'Dr. A. Sharma', specialty: 'General Practitioner', samples: 24, status: 'Prototype' };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Doctor Handwriting Adaptation</h1>
        <div className="prototype-banner">
          <Info className="w-3.5 h-3.5" />
          <span>Proposed Approach · Prototype</span>
        </div>
      </div>
      <p className="page-subtitle">Investigating whether doctor-specific calibration improves recognition.</p>

      <div className="max-w-4xl space-y-10">
        {/* Doctor Profile */}
        <EditableSection
          title="Sample Doctor Profile"
          items={doctorProfile}
          fields={[
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'specialty', label: 'Specialty', type: 'text' },
            { key: 'samples', label: 'Samples', type: 'number' },
            { key: 'status', label: 'Status', type: 'text' },
          ]}
          onSave={(items) => updateSection('doctor_profile', items)}
          className="animate-in"
        >
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">{profile.name}</div>
                <div className="text-xs text-slate-500">{profile.specialty}</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="stat-card">
                <div className="stat-value">{profile.samples}</div>
                <div className="stat-label">Calibration Samples</div>
              </div>
              <div className="stat-card">
                <span className="badge-yellow">{profile.status}</span>
                <div className="stat-label mt-1">Calibration Status</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-lg">—</div>
                <div className="stat-label">Evaluation Pending</div>
              </div>
            </div>
          </div>
        </EditableSection>

        {/* Calibration Categories */}
        <EditableSection
          title="Calibration Sample Categories"
          items={calibrationCategories}
          fields={[
            { key: 'name', label: 'Category', type: 'text' },
            { key: 'samples', label: 'Samples Description', type: 'text' },
            { key: 'count', label: 'Count', type: 'number' },
          ]}
          onSave={(items) => updateSection('calibration_categories', items)}
          className="animate-in-delay-1"
        >
          <div className="card divide-y divide-slate-100">
            {calibrationCategories.map((cat: any, i: number) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">{cat.name}</div>
                  <div className="text-xs text-slate-500">{cat.samples}</div>
                </div>
                <span className="text-sm font-medium text-slate-600">{cat.count} samples</span>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* Adaptation Workflow */}
        <EditableSection
          title="Adaptation Workflow"
          items={adaptationSteps}
          fields={[{ key: 'value', label: 'Step', type: 'text' }]}
          onSave={(items) => updateSection('adaptation_steps', items)}
          className="animate-in-delay-2"
        >
          <div className="card p-5">
            <div className="max-w-xs mx-auto">
              {adaptationSteps.map((step: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-2 px-3 rounded bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-600">{i + 1}</span>
                    <span className="text-sm text-slate-700">{step.value}</span>
                  </div>
                  {i < adaptationSteps.length - 1 && (
                    <div className="flex justify-center py-1 text-slate-300">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </EditableSection>

        {/* Explanation */}
        <EditableSection
          headless
          items={explanation}
          fields={[{ key: 'text', label: 'Explanation', type: 'textarea' }]}
          onSave={(items) => updateSection('explanation', items)}
        >
          <div className="card p-5 bg-slate-50">
            {explanation.map((item: any, i: number) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
            ))}
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
