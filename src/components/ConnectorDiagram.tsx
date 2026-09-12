import React, { useState, useEffect, useRef } from 'react';
import MedicinePillMascot from './MedicinePillMascot';
import { Sparkles, Activity, ShieldCheck, Stethoscope, Building2, User, Heart } from 'lucide-react';

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  role: string;
  avatar: string;
  icon: any;
  color: string;
  badgeColor: string;
  metric: string;
  status: string;
  pathId: string;
}

const NODES: NodeData[] = [
  {
    id: 'node-doctor',
    label: 'Dr. Susan Eringcott',
    sublabel: 'Calibrated Handwriting Model',
    role: 'Attending Physician',
    avatar: '👩‍⚕️',
    icon: Stethoscope,
    color: '#FFE8ED',
    badgeColor: '#F52F4F',
    metric: '98.4% OCR Confidence',
    status: 'Verified',
    pathId: 'path-top',
  },
  {
    id: 'node-patient',
    label: 'Sammy Beswick',
    sublabel: 'Dosage Adherence & Schedule',
    role: 'Patient Record',
    avatar: '👤',
    icon: Heart,
    color: '#E0F5EE',
    badgeColor: '#059669',
    metric: '3 Doses Scheduled Today',
    status: 'In Sync',
    pathId: 'path-mid',
  },
  {
    id: 'node-pharmacy',
    label: 'Jay Frenshaw',
    sublabel: 'Formulary SKU & Inventory',
    role: 'Clinical Pharmacist',
    avatar: '👨‍🔬',
    icon: Building2,
    color: '#FFF0C8',
    badgeColor: '#D97706',
    metric: 'Apollo SKU #AMX-500 Matched',
    status: 'Dispatched',
    pathId: 'path-bot',
  },
];

export default function ConnectorDiagram() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [centerPulsing, setCenterPulsing] = useState(false);
  const [activeSignals, setActiveSignals] = useState<{ id: number; path: string; progress: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const signalCounter = useRef(0);

  // Proximity magnetic offset state
  const [offsets, setOffsets] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Signal triggering helper
  const triggerSignal = (path: string) => {
    const sigId = ++signalCounter.current;
    setActiveSignals((prev) => [...prev, { id: sigId, path, progress: 0 }]);

    // Animate signal packet along path
    let p = 0;
    const interval = setInterval(() => {
      p += 0.08;
      if (p >= 1) {
        clearInterval(interval);
        setActiveSignals((prev) => prev.filter((s) => s.id !== sigId));
        // Center arrival reaction
        setCenterPulsing(true);
        setTimeout(() => setCenterPulsing(false), 400);
      } else {
        setActiveSignals((prev) =>
          prev.map((s) => (s.id === sigId ? { ...s, progress: p } : s))
        );
      }
    }, 40);
  };

  // Ambient quiet signal loop
  useEffect(() => {
    let timer: any;
    const runAmbientSignal = () => {
      const paths = ['path-top', 'path-mid', 'path-bot'];
      const randomPath = paths[Math.floor(Math.random() * paths.length)];
      triggerSignal(randomPath);
      timer = setTimeout(runAmbientSignal, 3500 + Math.random() * 2000);
    };

    timer = setTimeout(runAmbientSignal, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Smooth pointer proximity tracking for subtle magnetic micro-movement
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const newOffsets: { [key: string]: { x: number; y: number } } = {};

    NODES.forEach((node, i) => {
      // Estimate node positions
      const targetX = rect.width * 0.75;
      const targetY = (rect.height / 4) * (i + 1);

      const dx = cursorX - targetX;
      const dy = cursorY - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const factor = (1 - dist / 120) * 4; // Max 4px movement
        newOffsets[node.id] = {
          x: (dx / dist) * factor,
          y: (dy / dist) * factor,
        };
      } else {
        newOffsets[node.id] = { x: 0, y: 0 };
      }
    });

    setOffsets(newOffsets);
  };

  const handlePointerLeave = () => {
    setOffsets({});
  };

  const handleNodeHover = (node: NodeData) => {
    setActiveNodeId(node.id);
    triggerSignal(node.pathId);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative p-4 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 select-none"
    >
      {/* ─── SVG Connector Circuit Paths ───────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block"
        viewBox="0 0 500 300"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Signal Glow Filter */}
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Path 1: Top Node -> Center */}
        <path
          id="path-top"
          d="M 180 150 C 260 150, 280 65, 360 65"
          fill="none"
          stroke={activeNodeId === 'node-doctor' ? '#F52F4F' : '#351027'}
          strokeWidth={activeNodeId === 'node-doctor' ? '3.5' : '2'}
          strokeDasharray="4 4"
          className="transition-colors duration-200"
        />

        {/* Path 2: Middle Node -> Center */}
        <path
          id="path-mid"
          d="M 180 150 C 260 150, 280 150, 360 150"
          fill="none"
          stroke={activeNodeId === 'node-patient' ? '#059669' : '#351027'}
          strokeWidth={activeNodeId === 'node-patient' ? '3.5' : '2'}
          className="transition-colors duration-200"
        />

        {/* Path 3: Bottom Node -> Center */}
        <path
          id="path-bot"
          d="M 180 150 C 260 150, 280 235, 360 235"
          fill="none"
          stroke={activeNodeId === 'node-pharmacy' ? '#D97706' : '#351027'}
          strokeWidth={activeNodeId === 'node-pharmacy' ? '3.5' : '2'}
          strokeDasharray="4 4"
          className="transition-colors duration-200"
        />

        {/* ─── Active Traveling Signal Packets ─────────────────────────── */}
        {activeSignals.map((sig) => {
          let cx = 180;
          let cy = 150;
          if (sig.path === 'path-top') {
            cx = 360 - sig.progress * 180;
            cy = 65 + sig.progress * 85;
          } else if (sig.path === 'path-mid') {
            cx = 360 - sig.progress * 180;
            cy = 150;
          } else {
            cx = 360 - sig.progress * 180;
            cy = 235 - sig.progress * 85;
          }

          return (
            <g key={sig.id} filter="url(#cyanGlow)">
              <circle cx={cx} cy={cy} r="5" fill="#38BDF8" />
              <circle cx={cx} cy={cy} r="2.5" fill="#FFFFFF" />
            </g>
          );
        })}
      </svg>

      {/* ─── Center Hub: Pharmacon AI Core Pill ──────────────────────────── */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#F52F4F] border-[3.5px] border-[#351027] flex flex-col items-center justify-center shadow-tactile-xl transition-all duration-300 ${
            centerPulsing ? 'scale-110 ring-4 ring-[#38BDF8]/60 shadow-[0_0_25px_#38BDF8]' : 'hover:scale-105'
          }`}
        >
          <MedicinePillMascot size={64} mood={centerPulsing ? 'sparkle' : 'happy'} sparkles={true} />
          <span className="font-display font-black text-[11px] uppercase text-white tracking-wider mt-1">
            Pharmacon AI
          </span>
          <span className="text-[9px] font-mono text-white/80 font-bold">
            {centerPulsing ? '⚡ SIGNAL SYNCED' : 'CONNECTED HUB'}
          </span>
        </div>
      </div>

      {/* ─── Right Branching Hotspot Cards ───────────────────────────────── */}
      <div className="space-y-3.5 w-full max-w-sm relative z-10">
        {NODES.map((node) => {
          const isHovered = activeNodeId === node.id;
          const nodeOffset = offsets[node.id] || { x: 0, y: 0 };

          return (
            <div
              key={node.id}
              onMouseEnter={() => handleNodeHover(node)}
              onMouseLeave={() => setActiveNodeId(null)}
              onClick={() => handleNodeHover(node)}
              style={{
                transform: `translate(${nodeOffset.x}px, ${nodeOffset.y}px)`,
              }}
              className={`p-3.5 px-4 rounded-3xl bg-white border-[2.5px] border-[#351027] flex items-center justify-between gap-3 text-xs font-bold text-[#351027] cursor-pointer transition-all duration-200 shadow-tactile-sm ${
                isHovered
                  ? 'bg-[#FFE8ED] border-[#F52F4F] -translate-y-1 shadow-tactile'
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Circular Hotspot Avatar with Signal Ring */}
              <div className="relative flex-shrink-0">
                {isHovered && (
                  <span className="absolute -inset-1.5 rounded-full border-2 border-[#38BDF8] animate-ping opacity-75 pointer-events-none" />
                )}
                <span
                  className="w-10 h-10 rounded-full border-2 border-[#351027] flex items-center justify-center text-base shadow-tactile-sm transition-transform duration-200"
                  style={{
                    backgroundColor: node.color,
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {node.avatar}
                </span>
              </div>

              {/* Node Title & Description */}
              <div className="min-w-0 flex-1">
                <div className="truncate font-display font-extrabold text-sm text-[#351027]">
                  {node.label}
                </div>
                <div className="text-[10px] text-[#351027]/70 font-medium truncate">
                  {node.sublabel}
                </div>
              </div>

              {/* Status Pill Tag */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className="text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white border border-[#351027] shadow-tactile-sm"
                  style={{ backgroundColor: node.badgeColor }}
                >
                  {node.status}
                </span>
                <span className="text-[8px] font-bold text-emerald-800 mt-1">
                  {node.metric}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
