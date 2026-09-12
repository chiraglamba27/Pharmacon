// Mock data for the Pharmacon prototype
// All data is fictional and for demonstration purposes only

export interface PrescriptionField {
  label: string;
  value: string;
  confidence: number;
  needsVerification: boolean;
  correctedValue?: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  date: string;
  status: 'pending' | 'extracted' | 'reviewing' | 'confirmed' | 'dispensed';
  fields: PrescriptionField[];
  formularyMatch?: FormularyMatch;
}

export interface FormularyMatch {
  status: 'exact' | 'partial' | 'none';
  matchedItem?: InventoryItem;
  suggestions?: string[];
  message: string;
}

export interface InventoryItem {
  id: string;
  medicine: string;
  strength: string;
  dosageForm: string;
  sku: string;
  packSize: string;
  stock: number;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  status: 'success' | 'warning' | 'info';
  details?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
}

export interface Version {
  id: string;
  name: string;
  date: string;
  authors: string;
  status: 'current' | 'future' | 'archived';
  changeSummary: string;
}

export interface Deliverable {
  id: string;
  title: string;
  type: string;
  version: string;
  date: string;
  status: 'draft' | 'in-progress' | 'published';
}

export interface RefillRequest {
  id: string;
  patientName: string;
  patientId: string;
  medicine: string;
  strength: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
}

export interface CorrectionRecord {
  id: string;
  originalPrediction: string;
  correctedValue: string;
  field: string;
  doctorName: string;
  staffMember: string;
  timestamp: string;
  prescriptionId: string;
}

// ─── Sample Prescription ─────────────────────────────────────────────

export const samplePrescriptionFields: PrescriptionField[] = [
  { label: 'Patient Name', value: 'Rahul Kumar', confidence: 98, needsVerification: false },
  { label: 'Medicine', value: 'Amoxicillin', confidence: 94, needsVerification: false },
  { label: 'Strength', value: '500 mg', confidence: 97, needsVerification: false },
  { label: 'Dosage Form', value: 'Tablet', confidence: 96, needsVerification: false },
  { label: 'Frequency', value: '1-0-1', confidence: 86, needsVerification: true },
  { label: 'Route', value: 'Oral', confidence: 92, needsVerification: false },
  { label: 'Duration', value: '5 days', confidence: 91, needsVerification: false },
  { label: 'Instructions', value: 'After food', confidence: 88, needsVerification: true },
  { label: 'Doctor', value: 'Dr. A. Sharma', confidence: 95, needsVerification: false },
];

export const samplePrescription: Prescription = {
  id: 'RX-2024-0001',
  patientName: 'Rahul Kumar',
  patientId: 'PT-1001',
  doctorName: 'Dr. A. Sharma',
  doctorId: 'DR-001',
  date: '2024-11-15',
  status: 'extracted',
  fields: samplePrescriptionFields,
  formularyMatch: {
    status: 'exact',
    matchedItem: {
      id: 'INV-001',
      medicine: 'Amoxicillin',
      strength: '500 mg',
      dosageForm: 'Tablet',
      sku: 'AMX-500-TAB',
      packSize: '10 tablets',
      stock: 124,
      reorderLevel: 30,
      status: 'in-stock',
      lastUpdated: '2024-11-14',
    },
    message: 'Exact formulary match found.',
  },
};

// ─── Inventory ────────────────────────────────────────────────────────

export const inventoryItems: InventoryItem[] = [
  { id: 'INV-001', medicine: 'Amoxicillin', strength: '500 mg', dosageForm: 'Tablet', sku: 'AMX-500-TAB', packSize: '10 tablets', stock: 124, reorderLevel: 30, status: 'in-stock', lastUpdated: '2024-11-14' },
  { id: 'INV-002', medicine: 'Paracetamol', strength: '650 mg', dosageForm: 'Tablet', sku: 'PCM-650-TAB', packSize: '15 tablets', stock: 256, reorderLevel: 50, status: 'in-stock', lastUpdated: '2024-11-14' },
  { id: 'INV-003', medicine: 'Metformin', strength: '500 mg', dosageForm: 'Tablet', sku: 'MET-500-TAB', packSize: '10 tablets', stock: 18, reorderLevel: 25, status: 'low-stock', lastUpdated: '2024-11-13' },
  { id: 'INV-004', medicine: 'Azithromycin', strength: '250 mg', dosageForm: 'Tablet', sku: 'AZT-250-TAB', packSize: '6 tablets', stock: 0, reorderLevel: 20, status: 'out-of-stock', lastUpdated: '2024-11-12' },
  { id: 'INV-005', medicine: 'Omeprazole', strength: '20 mg', dosageForm: 'Capsule', sku: 'OMP-020-CAP', packSize: '10 capsules', stock: 89, reorderLevel: 25, status: 'in-stock', lastUpdated: '2024-11-14' },
  { id: 'INV-006', medicine: 'Cetirizine', strength: '10 mg', dosageForm: 'Tablet', sku: 'CTZ-010-TAB', packSize: '10 tablets', stock: 200, reorderLevel: 40, status: 'in-stock', lastUpdated: '2024-11-14' },
  { id: 'INV-007', medicine: 'Atorvastatin', strength: '10 mg', dosageForm: 'Tablet', sku: 'ATV-010-TAB', packSize: '10 tablets', stock: 45, reorderLevel: 20, status: 'in-stock', lastUpdated: '2024-11-13' },
  { id: 'INV-008', medicine: 'Ibuprofen', strength: '400 mg', dosageForm: 'Tablet', sku: 'IBP-400-TAB', packSize: '10 tablets', stock: 12, reorderLevel: 25, status: 'low-stock', lastUpdated: '2024-11-12' },
];

// ─── Audit Trail ──────────────────────────────────────────────────────

export const auditEvents: AuditEvent[] = [
  { id: 'AE-001', timestamp: '2024-11-15 09:15:22', user: 'Dr. A. Sharma', role: 'Doctor', action: 'Prescription uploaded', entity: 'Prescription', entityId: 'RX-2024-0001', status: 'info' },
  { id: 'AE-002', timestamp: '2024-11-15 09:15:24', user: 'System', role: 'AI Adapter', action: 'AI extraction generated', entity: 'Prescription', entityId: 'RX-2024-0001', status: 'success' },
  { id: 'AE-003', timestamp: '2024-11-15 09:15:25', user: 'System', role: 'AI Adapter', action: 'Low-confidence field flagged', entity: 'Field: Frequency', entityId: 'RX-2024-0001', status: 'warning' },
  { id: 'AE-004', timestamp: '2024-11-15 09:15:25', user: 'System', role: 'AI Adapter', action: 'Low-confidence field flagged', entity: 'Field: Instructions', entityId: 'RX-2024-0001', status: 'warning' },
  { id: 'AE-005', timestamp: '2024-11-15 09:18:10', user: 'Priya Desai', role: 'Clinic Staff', action: 'Staff correction made', entity: 'Field: Instructions', entityId: 'RX-2024-0001', status: 'info' },
  { id: 'AE-006', timestamp: '2024-11-15 09:18:30', user: 'System', role: 'Formulary Service', action: 'Formulary match performed', entity: 'Prescription', entityId: 'RX-2024-0001', status: 'success' },
  { id: 'AE-007', timestamp: '2024-11-15 09:20:45', user: 'Priya Desai', role: 'Clinic Staff', action: 'Prescription confirmed', entity: 'Prescription', entityId: 'RX-2024-0001', status: 'success' },
  { id: 'AE-008', timestamp: '2024-11-15 09:20:46', user: 'System', role: 'Inventory Adapter', action: 'Inventory updated', entity: 'Inventory', entityId: 'INV-001', status: 'success' },
  { id: 'AE-009', timestamp: '2024-11-15 09:20:47', user: 'System', role: 'Patient Service', action: 'Patient dashboard updated', entity: 'Patient', entityId: 'PT-1001', status: 'success' },
  { id: 'AE-010', timestamp: '2024-11-15 14:30:00', user: 'Rahul Kumar', role: 'Patient', action: 'Refill requested', entity: 'Prescription', entityId: 'RX-2024-0001', status: 'info' },
];

// ─── Team ─────────────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  { id: 'T-001', name: 'Aryan Sharma', role: 'Team Member', focus: 'Project development and engineering', avatar: 'AS' },
  { id: 'T-002', name: 'Aniket Raj', role: 'Team Member', focus: 'Project development and engineering', avatar: 'AR' },
  { id: 'T-003', name: 'Amitesh Kumar Singh', role: 'Team Member', focus: 'Project development and engineering', avatar: 'AK' },
  { id: 'T-004', name: 'Chirag Lamba', role: 'Team Member', focus: 'Project development and engineering', avatar: 'CL' },
];

// ─── Versions ─────────────────────────────────────────────────────────

export const versions: Version[] = [
  { id: 'V-001', name: 'Planning V1', date: '2024-11-15', authors: 'Team', status: 'current', changeSummary: 'Initial project direction, proposed system architecture, prototype, validation and evaluation plans.' },
  { id: 'V-002', name: 'Planning V2', date: 'TBD', authors: 'Team', status: 'future', changeSummary: 'Refined scope based on professor and team feedback.' },
  { id: 'V-003', name: 'Mid-Sem', date: 'TBD', authors: 'Team', status: 'future', changeSummary: 'Mid-semester deliverable with functional prototype and initial evaluation.' },
  { id: 'V-004', name: 'Final', date: 'TBD', authors: 'Team', status: 'future', changeSummary: 'Final deliverable with complete evaluation results and documentation.' },
];

// ─── Deliverables ─────────────────────────────────────────────────────

export const deliverables: Deliverable[] = [
  { id: 'D-001', title: 'Planning V1', type: 'Report', version: 'v1.0', date: '2024-11-15', status: 'in-progress' },
  { id: 'D-002', title: 'Software Grid', type: 'Spreadsheet', version: 'v1.0', date: '2024-11-15', status: 'draft' },
  { id: 'D-003', title: 'Presentation', type: 'Slides', version: 'v1.0', date: 'TBD', status: 'draft' },
  { id: 'D-004', title: 'Report', type: 'Document', version: 'v1.0', date: 'TBD', status: 'draft' },
  { id: 'D-005', title: 'Prototype Demo', type: 'Demo', version: 'v1.0', date: '2024-11-15', status: 'in-progress' },
  { id: 'D-006', title: 'Future Deliverables', type: 'Planned', version: '—', date: 'TBD', status: 'draft' },
];

// ─── Refill Requests ──────────────────────────────────────────────────

export const refillRequests: RefillRequest[] = [
  { id: 'RF-001', patientName: 'Rahul Kumar', patientId: 'PT-1001', medicine: 'Amoxicillin 500 mg', strength: '500 mg', requestDate: '2024-11-20', status: 'pending' },
  { id: 'RF-002', patientName: 'Meera Patel', patientId: 'PT-1002', medicine: 'Metformin 500 mg', strength: '500 mg', requestDate: '2024-11-19', status: 'approved' },
];

// ─── Correction History ───────────────────────────────────────────────

export const correctionHistory: CorrectionRecord[] = [
  { id: 'CR-001', originalPrediction: 'Amoxcillin', correctedValue: 'Amoxicillin', field: 'Medicine Name', doctorName: 'Dr. A. Sharma', staffMember: 'Priya Desai', timestamp: '2024-11-14 10:22:15', prescriptionId: 'RX-2024-0042' },
  { id: 'CR-002', originalPrediction: '1-0-2', correctedValue: '1-0-1', field: 'Frequency', doctorName: 'Dr. A. Sharma', staffMember: 'Priya Desai', timestamp: '2024-11-14 10:23:01', prescriptionId: 'RX-2024-0042' },
  { id: 'CR-003', originalPrediction: 'Paracetmol', correctedValue: 'Paracetamol', field: 'Medicine Name', doctorName: 'Dr. R. Gupta', staffMember: 'Anil Mehta', timestamp: '2024-11-13 15:45:30', prescriptionId: 'RX-2024-0038' },
  { id: 'CR-004', originalPrediction: '250mg', correctedValue: '500 mg', field: 'Strength', doctorName: 'Dr. R. Gupta', staffMember: 'Anil Mehta', timestamp: '2024-11-13 15:46:00', prescriptionId: 'RX-2024-0038' },
];

// ─── Demo Users ───────────────────────────────────────────────────────

export interface DemoUser {
  username: string;
  password: string;
  name: string;
  role: 'doctor' | 'clinic-staff' | 'pharmacist' | 'patient' | 'admin';
}

export const demoUsers: DemoUser[] = [
  { username: 'doctor', password: 'demo', name: 'Dr. A. Sharma', role: 'doctor' },
  { username: 'clinic', password: 'demo', name: 'Priya Desai', role: 'clinic-staff' },
  { username: 'pharmacy', password: 'demo', name: 'Vikram Singh', role: 'pharmacist' },
  { username: 'patient', password: 'demo', name: 'Rahul Kumar', role: 'patient' },
  { username: 'admin', password: 'demo', name: 'System Admin', role: 'admin' },
];

// ─── Evaluation Data (Illustrative) ──────────────────────────────────

export const evaluationData = {
  versions: [
    { name: 'V1: Generic', cer: 18.5, wer: 32.1, medicineAcc: 72.0, strengthAcc: 78.0, skuAcc: 65.0 },
    { name: 'V2: Generic + Dict', cer: 12.3, wer: 21.4, medicineAcc: 84.0, strengthAcc: 85.0, skuAcc: 78.0 },
    { name: 'V3: Adapted', cer: 8.1, wer: 14.2, medicineAcc: 91.0, strengthAcc: 92.0, skuAcc: 85.0 },
    { name: 'V4: Adapted + Dict + CL', cer: 5.2, wer: 9.8, medicineAcc: 96.0, strengthAcc: 97.0, skuAcc: 93.0 },
  ],
  disclaimer: 'Illustrative prototype data — not actual experimental results.',
};

// ─── Patient Schedule ─────────────────────────────────────────────────

export const patientSchedule = {
  patient: { name: 'Rahul Kumar', id: 'PT-1001' },
  prescriptions: [
    {
      id: 'RX-2024-0001',
      medicine: 'Amoxicillin',
      strength: '500 mg',
      form: 'Tablet',
      frequency: '1-0-1',
      route: 'Oral',
      duration: '5 days',
      instructions: 'After food',
      doctor: 'Dr. A. Sharma',
      date: '2024-11-15',
      status: 'confirmed' as const,
      schedule: {
        morning: true,
        afternoon: false,
        night: true,
      },
    },
  ],
  refills: [
    { medicine: 'Amoxicillin 500 mg', status: 'pending' as const, requestDate: '2024-11-20' },
  ],
};

// ─── Risk Register ────────────────────────────────────────────────────

export interface Risk {
  id: string;
  risk: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
  fallback: string;
}

export const risks: Risk[] = [
  { id: 'R-01', risk: 'Handwriting recognition accuracy', impact: 'high', mitigation: 'Doctor-specific calibration; confidence-aware review; human verification step', fallback: 'Manual transcription with partial AI assistance' },
  { id: 'R-02', risk: 'Insufficient calibration samples', impact: 'medium', mitigation: 'Structured calibration workflow; minimum sample requirements', fallback: 'Fall back to generic model with lower confidence thresholds' },
  { id: 'R-03', risk: 'Medicine-name ambiguity', impact: 'high', mitigation: 'Formulary dictionary constraints; fuzzy matching with human confirmation', fallback: 'Manual medicine selection from formulary list' },
  { id: 'R-04', risk: 'Incorrect extraction', impact: 'high', mitigation: 'Mandatory human review; confidence flagging; audit trail', fallback: 'Full manual entry with AI suggestions only' },
  { id: 'R-05', risk: 'Inventory integration complexity', impact: 'medium', mitigation: 'API adapter pattern; mock inventory for prototype', fallback: 'Manual inventory lookup alongside prescription' },
  { id: 'R-06', risk: 'Prescription data privacy', impact: 'high', mitigation: 'Role-based access; encrypted storage; audit logging', fallback: 'Anonymised demo data; no real patient data in prototype' },
  { id: 'R-07', risk: 'Unauthorized access', impact: 'high', mitigation: 'Authentication; role-based permissions; session management', fallback: 'Restrict prototype to local/demo environment' },
  { id: 'R-08', risk: 'Medical safety concerns', impact: 'high', mitigation: 'System does not recommend/substitute medicines; human confirmation required', fallback: 'Clearly label all outputs as requiring professional verification' },
  { id: 'R-09', risk: 'Scope creep', impact: 'medium', mitigation: 'Modular architecture; clear scope boundaries; iterative planning', fallback: 'Prioritise core workflow; defer secondary features' },
];
