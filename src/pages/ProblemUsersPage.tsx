import { Stethoscope, ClipboardList, Package, User, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  ClipboardList,
  Package,
  User,
  Settings,
};

export default function ProblemUsersPage() {
  const { sections, loading, updateSection } = useEditableContent('problem-users');
  const problemIntro = sections.problem_intro || [];
  const problems = sections.problems || [];
  const userGroups = sections.user_groups || [];
  const disclaimer = sections.problem_disclaimer || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Problem & Users</h1>
      <p className="page-subtitle">Understanding the challenges and the people Pharmacon aims to help.</p>

      <div className="max-w-4xl space-y-10">
        {/* Problem */}
        <EditableSection
          title="The Problem Space"
          items={problems}
          fields={[{ key: 'value', label: 'Problem', type: 'textarea' }]}
          onSave={(items) => updateSection('problems', items)}
          className="animate-in"
        >
          <div className="card p-5">
            {problemIntro[0] && (
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{problemIntro[0].text}</p>
            )}
            <ul className="space-y-2.5">
              {problems.map((item: any, i: number) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  {item.value}
                </li>
              ))}
            </ul>
            {disclaimer[0] && (
              <p className="text-xs text-slate-400 mt-4 italic">{disclaimer[0].text}</p>
            )}
          </div>
        </EditableSection>

        {/* User Groups */}
        <EditableSection
          title="User Groups"
          items={userGroups}
          fields={[
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'icon', label: 'Icon', type: 'select', options: ['Stethoscope', 'ClipboardList', 'Package', 'User', 'Settings'] },
            { key: 'who', label: 'Who they are', type: 'textarea' },
            { key: 'need', label: 'What they need', type: 'textarea' },
            { key: 'help', label: 'How Pharmacon helps', type: 'textarea' },
          ]}
          onSave={(items) => updateSection('user_groups', items)}
          className="animate-in-delay-1"
        >
          <div className="space-y-4">
            {userGroups.map((group: any, i: number) => {
              const Icon = iconMap[group.icon] || User;
              return (
                <div key={i} className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-md bg-primary-50 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">{group.name}</h3>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Who they are</div>
                      <p className="text-sm text-slate-600 leading-relaxed">{group.who}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">What they need</div>
                      <p className="text-sm text-slate-600 leading-relaxed">{group.need}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">How Pharmacon could help</div>
                      <p className="text-sm text-slate-600 leading-relaxed">{group.help}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
