import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/Toast';
import { UploadCloud, FileImage, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClinicUpload() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { show, ToastContainer } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [notes, setNotes] = useState('');
  
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest('/api/users', {}, session),
  });
  
  const allUsers = usersData?.data || [];
  const patients = allUsers.filter(u => u.role === 'patient');
  const doctors = allUsers.filter(u => u.role === 'doctor');

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('file', file);
      if (patientId) formData.append('patient_id', patientId);
      if (doctorId) formData.append('doctor_id', doctorId);
      if (notes) formData.append('notes', notes);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries(['clinic-prescriptions']);
      show('Prescription uploaded successfully', 'success');
      // Redirect to review queue if it immediately needs review (e.g. AI model unavailable)
      if (data?.data?.status === 'NEEDS_REVIEW') {
        setTimeout(() => navigate('/clinic/review'), 1500);
      } else {
        setFile(null);
        setPatientId('');
        setDoctorId('');
        setNotes('');
      }
    },
    onError: (err) => show(err.message, 'error'),
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <ToastContainer />
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Upload Prescription</h1>
          <p className="page-subtitle">Digitize a new handwritten prescription</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={e => { e.preventDefault(); if (file) uploadMutation.mutate(); }} className="card-body">
          <div className="space-y-6">
            
            {/* File Dropzone */}
            <div>
              <label className="form-label font-semibold">Prescription Image/PDF *</label>
              {!file ? (
                <div className="border-2 border-dashed border-surface-300 rounded-xl p-10 text-center hover:bg-surface-50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.tiff"
                    onChange={e => setFile(e.target.files[0])}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 text-brand-600 mb-3" />
                    <span className="text-sm font-medium text-surface-900">Click to select file</span>
                    <span className="text-xs text-surface-500 mt-1">PNG, JPG, PDF up to 20MB</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-brand-50 border border-brand-200 rounded-xl">
                  <div className="flex items-center gap-3 truncate">
                    <FileImage className="w-6 h-6 text-brand-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-brand-900 truncate">{file.name}</span>
                    <span className="text-xs text-brand-700">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-brand-100 rounded text-brand-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Patient (Optional)</label>
                <select className="form-input" value={patientId} onChange={e => setPatientId(e.target.value)}>
                  <option value="">-- Unassigned (Search by name) --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                <p className="text-xs text-surface-500 mt-1">Link to existing patient record.</p>
              </div>
              <div>
                <label className="form-label">Doctor (Optional)</label>
                <select className="form-input" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  <option value="">-- Unassigned (Assign later) --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
                  ))}
                </select>
                <p className="text-xs text-surface-500 mt-1">Assign to a doctor for confirmation.</p>
              </div>
            </div>

            <div>
              <label className="form-label">Internal Notes (Optional)</label>
              <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g. blurry handwriting, confirm with doctor" />
            </div>

            <div className="pt-4 border-t border-surface-100 flex justify-end">
              <button type="submit" disabled={!file || uploadMutation.isPending} className="btn-primary px-8">
                {uploadMutation.isPending ? 'Uploading & Processing...' : 'Upload Prescription'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
