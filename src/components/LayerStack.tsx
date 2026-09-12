import React from 'react';
import { Shield, Activity, FileText, MapPin, Cpu } from 'lucide-react';
import MedicinePillMascot from './MedicinePillMascot';

export default function LayerStack() {
  return (
    <div className="relative p-6 flex items-center justify-center">
      <div className="space-y-[-24px] w-full max-w-sm">
        {/* Layer 5 (Top) */}
        <div className="p-4 rounded-3xl bg-[#F52F4F] border-[3px] border-[#351027] shadow-tactile-lg flex items-center justify-between text-white transform -rotate-1 hover:scale-105 transition-transform z-50 relative">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5" />
            <span className="font-display font-extrabold text-sm">Doctor Verified Clinical Core</span>
          </div>
          <span className="text-xs font-mono font-bold">L5</span>
        </div>

        {/* Layer 4 */}
        <div className="p-4 rounded-3xl bg-white border-[3px] border-[#351027] shadow-tactile-lg flex items-center justify-between text-[#351027] transform rotate-1 hover:scale-105 transition-transform z-40 relative">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#97D8C4]" />
            <span className="font-display font-extrabold text-sm">Confidence Scoring & Metrics</span>
          </div>
          <span className="text-xs font-mono font-bold">L4</span>
        </div>

        {/* Layer 3 */}
        <div className="p-4 rounded-3xl bg-[#8F1230] border-[3px] border-[#351027] shadow-tactile-lg flex items-center justify-between text-white transform -rotate-1 hover:scale-105 transition-transform z-30 relative">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#FECB66]" />
            <span className="font-display font-extrabold text-sm">Formulary & Inventory Sync</span>
          </div>
          <span className="text-xs font-mono font-bold">L3</span>
        </div>

        {/* Layer 2 */}
        <div className="p-4 rounded-3xl bg-white border-[3px] border-[#351027] shadow-tactile-lg flex items-center justify-between text-[#351027] transform rotate-1 hover:scale-105 transition-transform z-20 relative">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#F52F4F]" />
            <span className="font-display font-extrabold text-sm">Clinic Verification Loop</span>
          </div>
          <span className="text-xs font-mono font-bold">L2</span>
        </div>

        {/* Layer 1 (Bottom) */}
        <div className="p-4 rounded-3xl bg-[#F52F4F] border-[3px] border-[#351027] shadow-tactile-lg flex items-center justify-between text-white transform -rotate-1 hover:scale-105 transition-transform z-10 relative">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5" />
            <span className="font-display font-extrabold text-sm">Doctor Adaptive CV OCR</span>
          </div>
          <span className="text-xs font-mono font-bold">L1</span>
        </div>
      </div>
    </div>
  );
}
