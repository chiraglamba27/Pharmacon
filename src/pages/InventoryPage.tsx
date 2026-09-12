import { useEffect, useState } from 'react';
import { Info, Package } from 'lucide-react';
import { api } from '../api/client';

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  useEffect(() => { api.get<{ items: any[] }>('/inventory').then(data => setInventoryItems(data.items)).catch(() => {}); }, []);
  const statusBadge = (status: string) => {
    switch (status) {
      case 'in-stock': return 'badge-green';
      case 'low-stock': return 'badge-yellow';
      case 'out-of-stock': return 'badge-red';
      default: return 'badge-slate';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'in-stock': return 'In Stock';
      case 'low-stock': return 'Low Stock';
      case 'out-of-stock': return 'Out of Stock';
      default: return status;
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Formulary / Inventory</h1>
        <div className="prototype-banner">
          <Info className="w-3.5 h-3.5" />
          <span>Fictional Demo Data</span>
        </div>
      </div>
      <p className="page-subtitle">Demonstration inventory with formulary matching capabilities.</p>

      <div className="max-w-5xl space-y-6">
        {/* Table */}
        <div className="card overflow-hidden animate-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Medicine</th>
                  <th className="table-header">Strength</th>
                  <th className="table-header">Form</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Pack Size</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell font-medium">{item.medicine}</td>
                    <td className="table-cell">{item.strength}</td>
                    <td className="table-cell">{item.dosageForm}</td>
                    <td className="table-cell font-mono text-xs">{item.sku}</td>
                    <td className="table-cell">{item.packSize}</td>
                    <td className="table-cell font-medium">{item.stock}</td>
                    <td className="table-cell">
                      <span className={statusBadge(item.status)}>{statusLabel(item.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match Types */}
        <div className="animate-in-delay-1">
          <h2 className="section-heading">Formulary Match Types</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: 'Exact Match', desc: 'Medicine, strength and form match a formulary item exactly', badge: 'badge-green' },
              { type: 'Partial Match', desc: 'Medicine name matches but strength or form differs', badge: 'badge-yellow' },
              { type: 'No Match', desc: 'No formulary match — manual verification required', badge: 'badge-red' },
              { type: 'Needs Verification', desc: 'Low confidence in extracted medicine name', badge: 'badge-slate' },
            ].map((item, i) => (
              <div key={i} className="card p-4">
                <span className={`${item.badge} mb-2`}>{item.type}</span>
                <p className="text-xs text-slate-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div className="card p-4 bg-amber-50 border-amber-200 animate-in-delay-2">
          <div className="flex gap-3 items-start">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Medicine Matching Safety</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                The system never automatically recommends or substitutes another medicine. If there is no exact 
                formulary match: "No exact formulary match — manual verification required." The intended production 
                architecture would connect to an external inventory system through an API/adapter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
