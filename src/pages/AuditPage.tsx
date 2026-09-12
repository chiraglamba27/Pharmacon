import { useEffect, useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { api } from '../api/client';

export default function AuditPage() {
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  useEffect(() => { api.get<{ events: any[] }>('/audit').then(data => setAuditEvents(data.events)).catch(() => {}); }, []);
  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Audit Trail</h1>
        <div className="prototype-banner">
          <Info className="w-3.5 h-3.5" />
          <span>Prototype Data</span>
        </div>
      </div>
      <p className="page-subtitle">Complete audit log of prescription workflow events.</p>

      <div className="max-w-5xl">
        <div className="card overflow-hidden animate-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Entity</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-mono text-xs whitespace-nowrap">{event.timestamp}</td>
                    <td className="table-cell font-medium">{event.user}</td>
                    <td className="table-cell">
                      <span className="badge-slate">{event.role}</span>
                    </td>
                    <td className="table-cell">{event.action}</td>
                    <td className="table-cell text-xs">{event.entity}</td>
                    <td className="table-cell">
                      <span className={`inline-flex w-2 h-2 rounded-full ${statusIcon(event.status).split(' ')[0]}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
