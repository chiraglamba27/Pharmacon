import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState, ErrorState } from '../../components/States';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Search, Pill, CheckCircle, Package } from 'lucide-react';

export default function DispensingPage() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { show, ToastContainer } = useToast();

  const [search, setSearch] = useState('');
  const [selectedPres, setSelectedPres] = useState(null);
  
  // Dispensing items state: [{ medicine_id, requested_qty, dispense_qty }]
  const [dispenseItems, setDispenseItems] = useState([]);

  // Get prescriptions ready for dispensing
  const { data, isLoading, error } = useQuery({
    queryKey: ['dispense-queue'],
    queryFn: () => apiRequest('/api/prescriptions', {}, session),
  });

  const { data: medsData } = useQuery({
    queryKey: ['medicines-list'],
    queryFn: () => apiRequest('/api/inventory/medicines', {}, session),
  });
  const medicines = medsData?.data || [];
  const [showMedSelect, setShowMedSelect] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dispenseQty, setDispenseQty] = useState(1);

  const dispenseMutation = useMutation({
    mutationFn: (body) => apiRequest(`/api/prescriptions/${selectedPres.id}/dispense`, { method: 'POST', body: JSON.stringify(body) }, session),
    onSuccess: () => {
      qc.invalidateQueries(['dispense-queue']);
      setSelectedPres(null);
      setDispenseItems([]);
      show('Prescription dispensed successfully. Inventory updated.', 'success');
    },
    onError: (err) => show(err.message, 'error'),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const prescriptions = data?.data || [];
  const queue = prescriptions.filter(p => ['CONFIRMED', 'DISPENSING'].includes(p.status));
  const filtered = queue.filter(p => p.id.includes(search));

  function handleOpenDispense(pres) {
    setSelectedPres(pres);
    // Ideally we auto-populate from prescription_items, but for now allow manual add
    setDispenseItems([]); 
    setShowMedSelect(false);
  }

  function handleAddMed() {
    if (!selectedMedId || dispenseQty < 1) return;
    const med = medicines.find(m => m.id === selectedMedId);
    if (!med) return;
    setDispenseItems([...dispenseItems, { medicine_id: med.id, name: med.generic_name || med.name, dispense_qty: parseInt(dispenseQty, 10) }]);
    setSelectedMedId('');
    setDispenseQty(1);
    setShowMedSelect(false);
  }

  function handleRemoveMed(idx) {
    setDispenseItems(dispenseItems.filter((_, i) => i !== idx));
  }

  function handleDispenseSubmit(e) {
    e.preventDefault();
    if (dispenseItems.length === 0) {
      show('Please add at least one medicine to dispense', 'warning');
      return;
    }
    dispenseMutation.mutate({ items: dispenseItems.map(i => ({ medicine_id: i.medicine_id, dispense_qty: i.dispense_qty })) });
  }

  return (
    <div>
      <ToastContainer />
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Dispense Medication</h1>
          <p className="page-subtitle">Process confirmed prescriptions and deduct inventory.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" className="form-input pl-10" placeholder="Scan or search Prescription ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Prescription ID</th>
              <th>Date Confirmed</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4}><EmptyState title="No prescriptions ready for dispensing" icon={Pill} /></td></tr>
            )}
            {filtered.map(pres => (
              <tr key={pres.id}>
                <td className="font-mono text-sm font-semibold">{pres.id}</td>
                <td>{new Date(pres.updated_at || pres.created_at).toLocaleString()}</td>
                <td><StatusBadge status={pres.status} /></td>
                <td>
                  <button onClick={() => handleOpenDispense(pres)} className="btn-primary btn-sm">
                    <Package className="w-4 h-4 mr-1.5" /> Process
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selectedPres} onClose={() => setSelectedPres(null)} title={`Dispense Prescription - ${selectedPres?.id.split('-')[0]}`} maxWidth="max-w-2xl">
        {selectedPres?.refill_requests?.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Patient Refill Request</h3>
            <p className="text-sm text-amber-800">
              <span className="font-medium">Notes: </span>
              {selectedPres.refill_requests.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0].notes || 'No additional notes provided.'}
            </p>
          </div>
        )}
        <div className="mb-6 p-4 bg-brand-50 rounded-lg border border-brand-200">
          <h3 className="font-semibold text-brand-900 mb-2">Prescription Data</h3>
          <div className="text-sm text-brand-800 space-y-1">
            {selectedPres?.prescription_extraction_fields?.map(f => (
              <div key={f.id} className="grid grid-cols-3 gap-2 border-b border-brand-200 last:border-0 pb-1">
                <span className="font-medium">{f.field_name}:</span>
                <span className="col-span-2">{f.is_corrected ? f.corrected_value : f.extracted_value}</span>
              </div>
            ))}
            {(!selectedPres?.prescription_extraction_fields || selectedPres.prescription_extraction_fields.length === 0) && (
              <p>No extracted data. Please refer to original document.</p>
            )}
          </div>
        </div>

        <form onSubmit={handleDispenseSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-surface-900">Items to Dispense</h3>
            {!showMedSelect && (
              <button type="button" onClick={() => setShowMedSelect(true)} className="btn-secondary btn-sm">
                + Add Item
              </button>
            )}
          </div>

          {showMedSelect && (
            <div className="flex items-end gap-2 p-3 bg-surface-50 border border-surface-200 rounded-lg mb-4">
              <div className="flex-1">
                <label className="form-label text-xs">Medicine</label>
                <select className="form-input" value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)}>
                  <option value="">-- Select Medicine --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.generic_name || m.name} ({m.strength})</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="form-label text-xs">Qty</label>
                <input type="number" min="1" className="form-input" value={dispenseQty} onChange={e => setDispenseQty(e.target.value)} />
              </div>
              <button type="button" onClick={handleAddMed} className="btn-primary" disabled={!selectedMedId}>Add</button>
              <button type="button" onClick={() => setShowMedSelect(false)} className="btn-secondary">Cancel</button>
            </div>
          )}

          {dispenseItems.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-surface-200 rounded-xl text-center">
              <p className="text-surface-500 text-sm">No items added to dispensing list yet.</p>
            </div>
          ) : (
            <div className="border border-surface-200 rounded-lg overflow-hidden">
              <table className="table">
                <thead className="bg-surface-50">
                  <tr><th>Medicine</th><th>Quantity</th><th></th></tr>
                </thead>
                <tbody>
                  {dispenseItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-medium text-sm">{item.name}</td>
                      <td>{item.dispense_qty}</td>
                      <td className="text-right">
                        <button type="button" onClick={() => handleRemoveMed(idx)} className="text-danger text-sm hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-100">
            <button type="button" onClick={() => setSelectedPres(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={dispenseMutation.isPending || dispenseItems.length === 0} className="btn-primary">
              {dispenseMutation.isPending ? 'Processing...' : 'Complete Dispensing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
