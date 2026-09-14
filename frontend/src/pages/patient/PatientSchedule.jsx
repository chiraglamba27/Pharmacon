import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { ErrorState, EmptyState } from '../../components/States';
import { Calendar, Clock, Pill } from 'lucide-react';

export default function PatientSchedule() {
  const { session } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: () => apiRequest('/api/prescriptions', {}, session),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  // Get active items from confirmed/dispensed prescriptions
  const prescriptions = data?.data || [];
  const activePrescriptions = prescriptions.filter(p => p.status === 'CONFIRMED' || p.status === 'DISPENSING' || p.status === 'DISPENSED');
  
  const scheduleItems = [];
  activePrescriptions.forEach(p => {
    if (p.prescription_items) {
      p.prescription_items.forEach(item => {
        scheduleItems.push({
          ...item,
          prescription_id: p.id,
          date: p.created_at
        });
      });
    }
  });

  return (
    <div>
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Medication Schedule</h1>
          <p className="page-subtitle">Your active medications based on confirmed prescriptions.</p>
        </div>
      </div>

      {scheduleItems.length === 0 ? (
        <EmptyState 
          title="No Active Medications" 
          message="You don't have any active medications in your schedule." 
          icon={Calendar} 
        />
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {scheduleItems.map((item, idx) => (
            <div key={idx} className="card p-4 border-l-4 border-brand-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-brand-600" />
                    {item.medicine_name_snapshot}
                  </h3>
                  <p className="text-surface-600 mt-1">
                    <span className="font-medium text-surface-900">{item.dosage}</span> • {item.frequency}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-surface-500">
                    {item.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {item.duration}
                      </span>
                    )}
                    {item.instructions && (
                      <span className="bg-surface-100 text-surface-700 px-2 py-0.5 rounded text-xs font-medium">
                        {item.instructions}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-surface-400">Ref: {item.prescription_id.split('-')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
