import React from 'react';
import { Activity, Heart, Flame, Clock } from 'lucide-react';

export default function DashboardGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {/* ─── Tile 1: Heart Rate Max ──────────────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white border-2 border-[#351027] shadow-tactile-sm hover:-translate-y-1 transition-transform">
        <div className="p-2 rounded-xl bg-[#FFE8ED] border border-[#351027] text-xs font-bold text-[#351027] mb-3 flex items-center justify-between">
          <span>Heart Rate</span>
          <Heart className="w-3.5 h-3.5 text-[#F52F4F] fill-current" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-extrabold text-[#351027]">206</span>
          <span className="text-xs text-[#351027]/60 font-bold">/m</span>
        </div>
        <div className="text-[10px] uppercase font-extrabold text-[#351027]/60 mt-1">MAX RATE</div>
      </div>

      {/* ─── Tile 2: Resting Heart Rate Spline ───────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white border-2 border-[#351027] shadow-tactile-sm hover:-translate-y-1 transition-transform">
        <div className="text-xs font-bold text-[#351027] mb-2">Resting Heart Rate</div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F5EE] border border-[#351027] text-xs font-extrabold text-[#351027]">
          <span>64 BPM</span>
          <span className="text-[10px] text-[#351027]/60">Average Today</span>
        </div>
        {/* Spline Graph */}
        <div className="h-10 mt-3 flex items-center justify-center">
          <svg viewBox="0 0 100 30" className="w-full h-full stroke-[#F52F4F] fill-none stroke-2">
            <path d="M0,20 Q25,5 50,15 T100,8" />
          </svg>
        </div>
      </div>

      {/* ─── Tile 3: Intensity Minutes Donut ─────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white border-2 border-[#351027] shadow-tactile-sm hover:-translate-y-1 transition-transform">
        <div className="p-2 rounded-xl bg-[#E0F5EE] border border-[#351027] text-xs font-bold text-[#351027] mb-2 flex items-center justify-between">
          <span>Intensity Minutes</span>
          <Activity className="w-3.5 h-3.5 text-emerald-700" />
        </div>
        <div className="text-center py-2">
          <div className="font-display text-2xl font-extrabold text-[#351027]">429</div>
          <div className="text-[9px] text-[#351027]/60 font-bold">150 TARGET</div>
        </div>
        <div className="flex justify-between text-[10px] font-mono font-bold text-[#351027]/60">
          <span>T</span><span>W</span><span>T</span><span className="text-[#351027] font-extrabold">F</span><span>S</span><span>S</span><span>M</span>
        </div>
      </div>

      {/* ─── Tile 4: Time Spent Active Zones ─────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white border-2 border-[#351027] shadow-tactile-sm hover:-translate-y-1 transition-transform">
        <div className="p-2 rounded-xl bg-[#FFF0C8] border border-[#351027] text-xs font-bold text-[#351027] mb-2 flex items-center justify-between">
          <span>Time Spent Active</span>
          <Clock className="w-3.5 h-3.5 text-amber-800" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[9px] text-[#351027]/60 font-bold">● ZONE 1</div>
            <div className="font-extrabold text-[#351027]">520 mins</div>
          </div>
          <div>
            <div className="text-[9px] text-[#351027]/60 font-bold">● ZONE 2</div>
            <div className="font-extrabold text-[#351027]">360 mins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
