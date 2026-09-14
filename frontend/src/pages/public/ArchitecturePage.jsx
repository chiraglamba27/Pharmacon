import { Server, Database, Layout, ShieldCheck, ArrowDown } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-2">System Architecture</h1>
      <p className="text-surface-600 mb-10">High-level overview of the Pharmacon technical stack and data flow.</p>

      {/* Diagram */}
      <div className="bg-white rounded-xl border border-surface-200 p-8 mb-12 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 mb-6 text-center">Data Flow Diagram</h2>
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-64 border-2 border-brand-200 bg-brand-50 p-4 rounded-xl text-center">
            <Layout className="w-6 h-6 text-brand-600 mx-auto mb-2" />
            <p className="font-semibold text-brand-900">React Frontend (Vite)</p>
            <p className="text-xs text-brand-700">UI &amp; State Management</p>
          </div>
          
          <ArrowDown className="w-6 h-6 text-surface-400" />
          
          <div className="w-64 border-2 border-surface-300 bg-surface-50 p-4 rounded-xl text-center">
            <Server className="w-6 h-6 text-surface-700 mx-auto mb-2" />
            <p className="font-semibold text-surface-900">Node.js / Express API</p>
            <p className="text-xs text-surface-600">Business Logic &amp; Auth Verification</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ArrowDown className="w-6 h-6 text-surface-400 rotate-45 transform origin-bottom-right" />
            <ArrowDown className="w-6 h-6 text-surface-400 -rotate-45 transform origin-bottom-left" />
          </div>

          <div className="flex gap-8">
            <div className="w-48 border-2 border-info-200 bg-info-light p-4 rounded-xl text-center">
              <Database className="w-6 h-6 text-info-dark mx-auto mb-2" />
              <p className="font-semibold text-info-dark">Supabase Postgres</p>
              <p className="text-xs text-info">Relational Data &amp; RLS</p>
            </div>
            <div className="w-48 border-2 border-success-200 bg-success-light p-4 rounded-xl text-center">
              <ShieldCheck className="w-6 h-6 text-success-dark mx-auto mb-2" />
              <p className="font-semibold text-success-dark">Supabase Auth/Storage</p>
              <p className="text-xs text-success">Identity &amp; Secure Files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-surface-900 mb-3">Key Architectural Decisions</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-surface-900">Authentication Flow:</strong>
                <p className="text-sm text-surface-600 mt-1">
                  The frontend negotiates JWTs with Supabase Auth. These tokens are passed as Bearer tokens to the Node.js API. The API verifies the token and dynamically fetches the user's role from the PostgreSQL database, ensuring roles cannot be spoofed on the client.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-surface-900">Secure File Storage:</strong>
                <p className="text-sm text-surface-600 mt-1">
                  Uploaded files (prescriptions) are streamed directly to a private Supabase Storage bucket. Access is strictly controlled via short-lived signed URLs generated exclusively by the Node.js API for authorized users.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
              <div>
                <strong className="text-surface-900">AI Abstraction Layer:</strong>
                <p className="text-sm text-surface-600 mt-1">
                  The handwriting recognition model is isolated behind a dedicated service layer (<code>PrescriptionRecognitionService</code>). This allows the entire workflow to be built, tested, and utilized with manual fallbacks while the ML model is pending integration.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
