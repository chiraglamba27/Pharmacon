import React, { useEffect, useState } from 'react';
import {
  Package, CheckCircle2, AlertTriangle, Phone, Plus,
  Minus, Check, X, Search, Building2, RefreshCw, Layers
} from 'lucide-react';
import MedicinePillMascot from '../../components/MedicinePillMascot';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface RefillItem {
  id: string;
  prescriptionId: string;
  patientName: string;
  medicine: string;
  strength: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  requestDate: string;
}

interface InventoryItem {
  id: string;
  medicine: string;
  strength: string;
  dosageForm: string;
  sku: string;
  packSize: string;
  stock: number;
  reorderLevel: number;
  status: string;
}

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [refills, setRefills] = useState<RefillItem[]>([
    {
      id: 'RF-101',
      prescriptionId: 'RX-2026-0081',
      patientName: 'Rahul Kumar',
      medicine: 'Amoxicillin',
      strength: '500 mg',
      status: 'pending',
      requestDate: '2026-08-25',
    },
    {
      id: 'RF-102',
      prescriptionId: 'RX-2026-0082',
      patientName: 'Meera Patel',
      medicine: 'Metformin',
      strength: '500 mg',
      status: 'pending',
      requestDate: '2026-08-24',
    },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'INV-001', medicine: 'Amoxicillin', strength: '500 mg', dosageForm: 'Capsule', sku: 'AMX-500-CAP', packSize: '100 caps', stock: 142, reorderLevel: 25, status: 'in-stock' },
    { id: 'INV-002', medicine: 'Metformin', strength: '500 mg', dosageForm: 'Tablet', sku: 'MET-500-TAB', packSize: '60 tabs', stock: 18, reorderLevel: 20, status: 'low-stock' },
    { id: 'INV-003', medicine: 'Paracetamol', strength: '650 mg', dosageForm: 'Tablet', sku: 'PAR-650-TAB', packSize: '100 tabs', stock: 240, reorderLevel: 30, status: 'in-stock' },
    { id: 'INV-004', medicine: 'Azithromycin', strength: '500 mg', dosageForm: 'Tablet', sku: 'AZI-500-TAB', packSize: '30 tabs', stock: 8, reorderLevel: 15, status: 'low-stock' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [addingMed, setAddingMed] = useState(false);
  const [newMed, setNewMed] = useState({
    medicine: '',
    strength: '500 mg',
    dosageForm: 'Tablet',
    sku: '',
    packSize: '100 tabs',
    stock: 50,
    reorderLevel: 15,
  });
  const [notification, setNotification] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<{ refills: RefillItem[] }>('/refills'),
      api.get<{ items: InventoryItem[] }>('/inventory'),
    ])
      .then(([refillData, inventoryData]) => {
        if (refillData.refills && refillData.refills.length > 0) setRefills(refillData.refills);
        if (inventoryData.items && inventoryData.items.length > 0) setInventory(inventoryData.items);
      })
      .catch(() => {});
  }, []);

  const updateRefillStatus = async (id: string, status: 'approved' | 'rejected' | 'contacted') => {
    try {
      await api.put(`/refills/${id}`, { status });
    } catch (e) {}

    setRefills((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    if (status === 'approved') {
      // Deduct inventory
      setInventory((prev) =>
        prev.map((item) => (item.id === 'INV-001' ? { ...item, stock: Math.max(0, item.stock - 1) } : item))
      );
      setNotification(`Refill ${id} approved! Inventory updated and patient notified.`);
    } else if (status === 'rejected') {
      setNotification(`Refill ${id} rejected.`);
    } else {
      setNotification(`Patient contacted regarding Refill ${id}.`);
    }

    setTimeout(() => setNotification(''), 4000);
  };

  const adjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          const newStatus = newStock === 0 ? 'out-of-stock' : newStock <= item.reorderLevel ? 'low-stock' : 'in-stock';
          return { ...item, stock: newStock, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      id: `INV-${Date.now().toString(36).toUpperCase()}`,
      medicine: newMed.medicine,
      strength: newMed.strength,
      dosageForm: newMed.dosageForm,
      sku: newMed.sku || `${newMed.medicine.slice(0, 3).toUpperCase()}-${newMed.strength.replace(/\s/g, '')}`,
      packSize: newMed.packSize,
      stock: Number(newMed.stock),
      reorderLevel: Number(newMed.reorderLevel),
      status: Number(newMed.stock) <= Number(newMed.reorderLevel) ? 'low-stock' : 'in-stock',
    };

    setInventory([item, ...inventory]);
    setAddingMed(false);
    setNewMed({ medicine: '', strength: '500 mg', dosageForm: 'Tablet', sku: '', packSize: '100 tabs', stock: 50, reorderLevel: 15 });
    setNotification(`Added ${item.medicine} to Formulary Inventory!`);
    setTimeout(() => setNotification(''), 4000);
  };

  const filteredInventory = inventory.filter((i) =>
    i.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#351027]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MedicinePillMascot size={28} mood="smart" />
            <span className="pill-tag-pink">Pharmacy Fulfillment Hub</span>
            <span className="pill-tag">Role: Pharmacist (Active)</span>
          </div>
          <h1 className="heading-chunky text-2xl sm:text-4xl text-[#351027]">
            Pharmacy Inventory & Refill Dispatch Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#351027]/70 mt-1 font-medium">
            Manage real-time medication stocks, review incoming patient refill requests, and match hospital formulary SKUs.
          </p>
        </div>

        <button onClick={() => setAddingMed(true)} className="btn-tactile btn-tactile-gold">
          <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Medication SKU</span>
          </span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-[#E0F5EE] border-2 border-[#351027] rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-tactile-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── 1. Refill Requests Queue ─────────────────────────────────────── */}
      <div className="card-tactile p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#351027]/10">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              Live Patient Refill Requests Queue
            </h2>
          </div>
          <span className="pill-tag-gold text-[10px]">
            {refills.filter((r) => r.status === 'pending').length} Pending Requests
          </span>
        </div>

        <div className="grid gap-3">
          {refills.map((refill) => (
            <div
              key={refill.id}
              className="p-4 rounded-2xl bg-[#FFF8E8] border-2 border-[#351027] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-tactile-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-sm text-[#351027]">
                    {refill.patientName}
                  </span>
                  <span className="text-[10px] font-mono text-[#351027]/60 font-bold">
                    ({refill.id} · {refill.prescriptionId})
                  </span>
                </div>
                <div className="text-xs text-[#351027] font-bold mt-1">
                  Medicine: <strong className="text-[#F52F4F]">{refill.medicine} {refill.strength}</strong> · Requested on {refill.requestDate}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {refill.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateRefillStatus(refill.id, 'approved')}
                      className="btn-tactile btn-tactile-dark"
                    >
                      <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Approve & Deduct
                      </span>
                    </button>
                    <button
                      onClick={() => updateRefillStatus(refill.id, 'rejected')}
                      className="btn-tactile btn-tactile-white"
                    >
                      <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1 text-red-600">
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </span>
                    </button>
                    <button
                      onClick={() => updateRefillStatus(refill.id, 'contacted')}
                      className="btn-tactile btn-tactile-pink"
                    >
                      <span className="btn-tactile-inner py-1.5 px-3 text-xs font-extrabold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        Contact
                      </span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border border-[#351027] ${
                      refill.status === 'approved' ? 'bg-[#E0F5EE] text-emerald-900' :
                      refill.status === 'rejected' ? 'bg-[#FFE8ED] text-red-700' :
                      'bg-[#FFF0C8] text-amber-900'
                    }`}
                  >
                    Status: {refill.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 2. Formulary Stock & Inventory Manager ───────────────────────── */}
      <div className="card-tactile p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#351027]/10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              Formulary Stock & SKU Manager
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#351027]/50 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#351027] bg-[#FFF8E8] text-xs font-bold"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border-2 border-[#351027] space-y-2 shadow-tactile-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#351027]">
                    {item.medicine} {item.strength}
                  </h3>
                  <span className="text-[10px] font-mono text-[#351027]/60 font-bold">
                    SKU: {item.sku} · {item.dosageForm} ({item.packSize})
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#351027] ${
                    item.status === 'in-stock' ? 'bg-[#E0F5EE] text-emerald-900' :
                    item.status === 'low-stock' ? 'bg-[#FFF0C8] text-amber-900' :
                    'bg-[#FFE8ED] text-red-700'
                  }`}
                >
                  {item.status === 'in-stock' ? 'In Stock' : item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#351027]/10 flex items-center justify-between">
                <div className="text-xs font-bold text-[#351027]">
                  Units in stock: <strong className="text-base text-[#F52F4F]">{item.stock}</strong>
                  <span className="text-[10px] text-[#351027]/60 ml-2">(Reorder at: {item.reorderLevel})</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustStock(item.id, -10)}
                    className="p-1 rounded-lg border border-[#351027] bg-[#FFE8ED] hover:bg-[#FFD3DC] text-[#351027]"
                    title="Deduct 10 units"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => adjustStock(item.id, 10)}
                    className="p-1 rounded-lg border border-[#351027] bg-[#E0F5EE] hover:bg-[#BFF0DE] text-[#351027]"
                    title="Add 10 units"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Add Medication Modal ─────────────────────────────────────────── */}
      {addingMed && (
        <div className="fixed inset-0 z-50 bg-[#351027]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF8E8] border-[3.5px] border-[#351027] rounded-4xl p-6 sm:p-8 max-w-lg w-full shadow-tactile-xl relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#351027]">
              <h3 className="heading-chunky text-lg text-[#351027]">Add New Medication to Formulary</h3>
              <button onClick={() => setAddingMed(false)} className="text-[#351027]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMed} className="space-y-3 text-xs font-bold text-[#351027]">
              <div>
                <label className="block uppercase tracking-wider mb-1">Medicine Generic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciprofloxacin"
                  value={newMed.medicine}
                  onChange={(e) => setNewMed({ ...newMed, medicine: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Strength</label>
                  <input
                    type="text"
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Dosage Form</label>
                  <select
                    value={newMed.dosageForm}
                    onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white font-bold"
                  >
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    value={newMed.stock}
                    onChange={(e) => setNewMed({ ...newMed, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={newMed.reorderLevel}
                    onChange={(e) => setNewMed({ ...newMed, reorderLevel: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#351027] bg-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#351027]/10">
                <button type="button" onClick={() => setAddingMed(false)} className="btn-tactile btn-tactile-white">
                  <span className="btn-tactile-inner py-1.5 px-4 text-xs font-bold">Cancel</span>
                </button>
                <button type="submit" className="btn-tactile btn-tactile-gold">
                  <span className="btn-tactile-inner py-1.5 px-5 text-xs font-bold">Save SKU</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
