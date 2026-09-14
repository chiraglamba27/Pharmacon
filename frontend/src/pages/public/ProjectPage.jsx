import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { PageSpinner } from '../../components/Spinner';
import { ErrorState } from '../../components/States';
import { Link } from 'react-router-dom';
import { AlertCircle, FileText, Cpu, CheckCircle } from 'lucide-react';

export default function ProjectPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-overview'],
    queryFn: () => apiRequest('/api/project/overview', {}, null),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message={error.message} />;

  const overview = data?.data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-6">Project Overview</h1>
      
      {overview?.content && (
        <div className="prose prose-brand max-w-none mb-12">
          {overview.content.split('\n').map((para, i) => (
            <p key={i} className="mb-4 text-surface-700 leading-relaxed">{para}</p>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="card card-body">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-semibold text-surface-900">Problem Statement</h2>
          </div>
          <p className="text-surface-600 text-sm leading-relaxed">
            Handwritten prescriptions in clinics often lead to poor readability, high error rates during dispensing, and lack of digital records for patients. Pharmacies struggle to seamlessly match manual prescriptions with digital inventory, causing delays.
          </p>
        </div>

        <div className="card card-body">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-success-dark" />
            <h2 className="text-xl font-semibold text-surface-900">Proposed Solution</h2>
          </div>
          <p className="text-surface-600 text-sm leading-relaxed">
            Pharmacon aims to digitize this pipeline by allowing clinics to upload handwritten prescriptions. An automated system extracts the text, which is then verified by professionals. The confirmed prescription directly ties into pharmacy inventory for secure dispensing.
          </p>
        </div>
      </div>

      <div className="alert-warning mb-12">
        <Cpu className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-warning-dark mb-1">AI Integration Status</h3>
          <p className="text-sm text-warning-dark">
            AI model integration is currently pending. The infrastructure and abstraction layer (PrescriptionRecognitionService) are in place, but a manual review workflow is actively used as the fallback until the OCR model is deployed.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-surface-900 mb-6">Explore More</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/presentations" className="card card-body hover:border-brand-300 hover:shadow-md transition-all no-underline group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-600">Presentations</h3>
            </div>
            <span className="text-surface-400 group-hover:text-brand-600">→</span>
          </div>
        </Link>
        
        <Link to="/architecture" className="card card-body hover:border-brand-300 hover:shadow-md transition-all no-underline group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-600">Architecture</h3>
            </div>
            <span className="text-surface-400 group-hover:text-brand-600">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
