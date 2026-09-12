import { Shield, Users, BarChart3, ClipboardCheck, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function ValidationPage() {
  const { sections, loading, updateSection } = useEditableContent('validation');
  const recognitionStudy = sections.recognition_study || [];
  const functionalTests = sections.functional_tests || [];
  const userTestingQuestions = sections.user_testing_questions || [];
  const evaluationCriteria = sections.evaluation_criteria || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Validation</h1>
      <p className="page-subtitle">Planned testing and validation approach for the Pharmacon system.</p>

      <div className="max-w-4xl space-y-10">
        <EditableSection
          title="Recognition Study Design"
          items={recognitionStudy}
          fields={[{ key: 'text', label: 'Content', type: 'textarea' }]}
          onSave={(items) => updateSection('recognition_study', items)}
          className="animate-in"
        >
          <h2 className="section-heading flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" />
            Recognition Study Design
          </h2>
          <div className="card p-5 text-sm text-slate-600 leading-relaxed">
            {recognitionStudy.map((item: any, i: number) => (
              <p key={i}>{item.text}</p>
            ))}
          </div>
        </EditableSection>

        {/* Functional Testing */}
        <EditableSection
          title="Functional Testing"
          items={functionalTests}
          fields={[
            { key: 'test', label: 'Test', type: 'text' },
            { key: 'status', label: 'Status', type: 'select', options: ['planned', 'prototype', 'passed', 'failed'] },
          ]}
          onSave={(items) => updateSection('functional_tests', items)}
          className="animate-in"
        >
          <h2 className="section-heading flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" />
            Functional Testing
          </h2>
          <div className="card divide-y divide-slate-100">
            {functionalTests.map((test: any, i: number) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-700">{test.test}</span>
                <span className={test.status === 'prototype' || test.status === 'passed' ? 'badge-blue' : 'badge-slate'}>
                  {test.status === 'prototype' ? 'Prototype' : test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* User Testing */}
        <EditableSection
          title="User Testing Questions"
          items={userTestingQuestions}
          fields={[{ key: 'value', label: 'Question', type: 'text' }]}
          onSave={(items) => updateSection('user_testing_questions', items)}
          className="animate-in-delay-1"
        >
          <h2 className="section-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" />
            User Testing Questions
          </h2>
          <div className="card p-5">
            <p className="text-sm text-slate-500 mb-4">
              Planned questions for user testing sessions to evaluate usability and effectiveness:
            </p>
            <ul className="space-y-2.5">
              {userTestingQuestions.map((q: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500 flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {q.value}
                </li>
              ))}
            </ul>
          </div>
        </EditableSection>

        {/* Evaluation Criteria */}
        <EditableSection
          title="Evaluation Criteria"
          items={evaluationCriteria}
          fields={[
            { key: 'criterion', label: 'Criterion', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
          onSave={(items) => updateSection('evaluation_criteria', items)}
          className="animate-in-delay-2"
        >
          <h2 className="section-heading flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-500" />
            Evaluation Criteria
          </h2>
          <div className="card divide-y divide-slate-100">
            {evaluationCriteria.map((item: any, i: number) => (
              <div key={i} className="px-4 py-3">
                <div className="text-sm font-medium text-slate-700">{item.criterion}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
