import { Info } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

interface ToolEntry {
  category: string;
  tool: string;
  version: string;
  purpose: string;
  license: string;
}

export default function SoftwareGridPage() {
  const { sections, loading, updateSection } = useEditableContent('software-grid');
  const tools: ToolEntry[] = sections.tools || [];
  const categories = Array.from(new Set(tools.map(s => s.category)));

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Software Grid</h1>
      <p className="page-subtitle">Technology stack and tools used in the Pharmacon project.</p>

      <div className="max-w-5xl space-y-8">
        {/* Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start animate-in">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            This grid reflects the current technology choices. Tools marked as "TBD" are planned for future phases.
            All tools are open-source or freely available.
          </p>
        </div>

        {/* Grid by category — editable */}
        <EditableSection
          title="Technology Stack"
          items={tools}
          fields={[
            { key: 'category', label: 'Category', type: 'text' },
            { key: 'tool', label: 'Tool', type: 'text' },
            { key: 'version', label: 'Version', type: 'text' },
            { key: 'purpose', label: 'Purpose', type: 'text' },
            { key: 'license', label: 'License', type: 'text' },
          ]}
          onSave={(items) => updateSection('tools', items)}
        >
          {categories.map((category, ci) => (
            <section key={category} className="animate-in mb-6" style={{ animationDelay: `${ci * 0.05}s` }}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{category}</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="table-header">Tool</th>
                      <th className="table-header">Version</th>
                      <th className="table-header">Purpose</th>
                      <th className="table-header">License</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tools
                      .filter(s => s.category === category)
                      .map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="table-cell font-medium text-slate-800">{item.tool}</td>
                        <td className="table-cell font-mono text-xs">{item.version}</td>
                        <td className="table-cell text-slate-600">{item.purpose}</td>
                        <td className="table-cell">
                          <span className="badge-slate">{item.license}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </EditableSection>

        {/* Summary */}
        <section className="animate-in">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="stat-value">{tools.length}</div>
              <div className="stat-label">Tools & Libraries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{tools.filter(s => s.license === 'MIT').length}</div>
              <div className="stat-label">MIT Licensed</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
