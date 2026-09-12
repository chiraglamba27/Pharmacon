import React, { useState } from 'react';
import MedicinePillMascot from './MedicinePillMascot';
import { Sparkles, Cpu, Activity, ShieldCheck, Database, Layers } from 'lucide-react';

interface PinNode {
  id: string;
  name: string;
  desc: string;
  color: string;
  pos: string;
}

const PIN_NODES: PinNode[] = [
  { id: 'pin-1', name: 'Vision Transformer', desc: 'Handwriting segmentation layer', color: '#F52F4F', pos: '-top-3 left-8' },
  { id: 'pin-2', name: 'Formulary DB', desc: 'Real-time SKU matching engine', color: '#FECB66', pos: '-bottom-3 right-8' },
  { id: 'pin-3', name: 'Writer Calibration', desc: '3-sheet adaptive embeddings', color: '#97D8C4', pos: '-left-3 top-14' },
  { id: 'pin-4', name: 'Safety Cross-Check', desc: '0 contraindications verified', color: '#FF6F89', pos: '-right-3 top-14' },
];

export default function CpuIllustration() {
  const [activePin, setActivePin] = useState<PinNode | null>(null);

  return (
    <div className="p-8 sm:p-12 rounded-4xl bg-white border-[3.5px] border-[#351027] shadow-tactile-lg flex flex-col items-center justify-center relative select-none">
      <div className="relative p-6 sm:p-8 bg-[#351027] rounded-3xl border-2 border-[#351027] shadow-tactile text-center">
        {/* Central Chip Die */}
        <div className="w-40 h-40 bg-[#FFF8E8] rounded-2xl border-2 border-[#351027] p-4 flex flex-col items-center justify-center space-y-2 shadow-inner group hover:scale-105 transition-transform">
          <MedicinePillMascot size={46} mood="smart" sparkles={true} />
          <div className="text-xs font-display font-extrabold uppercase text-[#351027] tracking-wider">
            Pharmacon AI
          </div>
          <div className="text-[9px] font-mono text-[#F52F4F] font-black bg-[#FFE8ED] px-2 py-0.5 rounded-full border border-[#351027]">
            CV-OCR CORE
          </div>
        </div>

        {/* Outer Circular Hotspot Pins */}
        {PIN_NODES.map((pin) => {
          const isHovered = activePin?.id === pin.id;
          return (
            <div
              key={pin.id}
              onMouseEnter={() => setActivePin(pin)}
              onMouseLeave={() => setActivePin(null)}
              onClick={() => setActivePin(isHovered ? null : pin)}
              className={`absolute ${pin.pos} cursor-pointer group`}
            >
              {isHovered && (
                <span
                  className="absolute -inset-1 rounded-full border-2 animate-ping opacity-75 pointer-events-none"
                  style={{ borderColor: pin.color }}
                />
              )}
              <div
                className="w-5 h-5 rounded-full border-2 border-[#351027] shadow-tactile-sm transition-transform duration-200"
                style={{
                  backgroundColor: pin.color,
                  transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Tactical Tooltip Anchor */}
      {activePin && (
        <div className="mt-4 p-2.5 px-4 rounded-2xl bg-[#FFF8E8] border-2 border-[#351027] shadow-tactile-sm text-center animate-in fade-in zoom-in-95 duration-150">
          <div className="font-display font-extrabold text-xs text-[#351027]">
            {activePin.name}
          </div>
          <div className="text-[10px] text-[#351027]/70 font-medium">
            {activePin.desc}
          </div>
        </div>
      )}
    </div>
  );
}
