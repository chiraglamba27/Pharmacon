import { Info, ArrowDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useEditableContent } from '../hooks/useEditableContent';
import EditableSection from '../components/EditableSection';

export default function EvaluationPage() {
  const { sections, loading, updateSection } = useEditableContent('evaluation');
  const systemVersions = sections.system_versions || [];
  const chartData = sections.chart_data || [];
  const metrics = sections.metrics || [];
  const evalProcess = sections.eval_process || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  const barData = chartData.map((v: any) => ({
    name: v.name,
    CER: v.cer,
    WER: v.wer,
    'Medicine Acc.': v.medicineAcc,
    'Strength Acc.': v.strengthAcc,
    'SKU Acc.': v.skuAcc,
  }));

  return (
    <div className="page-container">
      <h1 className="page-title">Evaluation</h1>
      <p className="page-subtitle">Proposed evaluation methodology and illustrative results.</p>

      <div className="max-w-5xl space-y-10">
        {/* Disclaimer */}
        <div className="prototype-banner animate-in">
          <Info className="w-3.5 h-3.5" />
          <span>Illustrative prototype data — not actual experimental results.</span>
        </div>

        {/* System Versions */}
        <EditableSection
          title="Proposed System Versions"
          items={systemVersions}
          fields={[
            { key: 'v', label: 'Version', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'text' },
          ]}
          onSave={(items) => updateSection('system_versions', items)}
          className="animate-in"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {systemVersions.map((item: any, i: number) => (
              <div key={i} className="card p-4">
                <span className="badge-blue text-[10px] mb-2">{item.v}</span>
                <div className="text-sm font-medium text-slate-800 mb-1">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* Charts */}
        <EditableSection
          title="Illustrative Error Rates"
          items={chartData}
          fields={[
            { key: 'name', label: 'Version Name', type: 'text' },
            { key: 'cer', label: 'CER %', type: 'number' },
            { key: 'wer', label: 'WER %', type: 'number' },
            { key: 'medicineAcc', label: 'Medicine Acc %', type: 'number' },
            { key: 'strengthAcc', label: 'Strength Acc %', type: 'number' },
            { key: 'skuAcc', label: 'SKU Acc %', type: 'number' },
          ]}
          onSave={(items) => updateSection('chart_data', items)}
          className="animate-in-delay-1"
        >
          <div className="card p-5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">Illustrative Prototype Data</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={2} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="CER" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="WER" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EditableSection>

        <section>
          <h2 className="section-heading">Illustrative Accuracy Comparison</h2>
          <div className="card p-5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">Illustrative Prototype Data</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[50, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Medicine Acc." stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Strength Acc." stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="SKU Acc." stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Metrics */}
        <EditableSection
          title="Evaluation Metrics"
          items={metrics}
          fields={[
            { key: 'metric', label: 'Metric', type: 'text' },
            { key: 'desc', label: 'Description', type: 'text' },
          ]}
          onSave={(items) => updateSection('metrics', items)}
        >
          <div className="card divide-y divide-slate-100">
            {metrics.map((item: any, i: number) => (
              <div key={i} className="px-4 py-3">
                <div className="text-sm font-medium text-slate-700">{item.metric}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </EditableSection>

        {/* Evaluation Process */}
        <EditableSection
          title="Intended Evaluation Process"
          items={evalProcess}
          fields={[{ key: 'value', label: 'Step', type: 'text' }]}
          onSave={(items) => updateSection('eval_process', items)}
        >
          <div className="card p-5">
            <div className="max-w-xs mx-auto">
              {evalProcess.map((step: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-2 px-3 rounded bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-600">{i + 1}</span>
                    <span className="text-sm text-slate-700">{step.value}</span>
                  </div>
                  {i < evalProcess.length - 1 && (
                    <div className="flex justify-center py-1 text-slate-300">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Held-out samples should be collected from every participating writer.
            </p>
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
