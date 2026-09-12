import React from 'react';

export default function ProfileCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
      {/* ─── Card 1: Stephen Raleigh ────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border-[2.5px] border-[#351027] shadow-tactile hover:-translate-y-1 transition-transform space-y-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#E0F5EE] border-2 border-[#351027] flex items-center justify-center font-display font-extrabold text-lg text-[#351027] mx-auto shadow-tactile-sm">
          SR
        </div>

        <h4 className="font-display font-extrabold text-base text-center text-[#351027]">
          Stephen Raleigh
        </h4>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-1 text-center py-2 border-y border-[#351027]/10 text-xs">
          <div>
            <div className="text-[#351027]/50 uppercase font-bold text-[9px]">Age</div>
            <div className="font-extrabold text-[#351027]">38</div>
          </div>
          <div>
            <div className="text-[#351027]/50 uppercase font-bold text-[9px]">Height</div>
            <div className="font-extrabold text-[#351027]">184 CM</div>
          </div>
          <div>
            <div className="text-[#351027]/50 uppercase font-bold text-[9px]">Weight</div>
            <div className="font-extrabold text-[#351027]">70 KG</div>
          </div>
        </div>

        {/* Category Tag Chips */}
        <div className="space-y-2">
          <span className="block px-3 py-1 rounded-full bg-[#F3E8FC] text-xs font-bold text-[#351027] text-center border border-[#351027]">
            Fitness Enthusiast
          </span>
          <span className="block px-3 py-1 rounded-full bg-[#E0F5EE] text-xs font-bold text-[#351027] text-center border border-[#351027]">
            Healthy Eater
          </span>
          <span className="block px-3 py-1 rounded-full bg-[#FFE8ED] text-xs font-bold text-[#351027] text-center border border-[#351027]">
            High Blood Pressure
          </span>
        </div>
      </div>

      {/* ─── Card 2: Violet Nordstrom ───────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#FFF8E8] border-[2.5px] border-[#351027] shadow-tactile hover:-translate-y-1 transition-transform space-y-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#FECB66] border-2 border-[#351027] flex items-center justify-center font-display font-extrabold text-lg text-[#351027] mx-auto shadow-tactile-sm">
          VN
        </div>

        <h4 className="font-display font-extrabold text-base text-center text-[#351027]">
          Violet Nordstrom
        </h4>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-1 text-center py-2 border-y border-[#351027]/10 text-xs">
          <div>
            <div className="text-[#351027]/50 uppercase font-bold text-[9px]">Age</div>
            <div className="font-extrabold text-[#351027]">32</div>
          </div>
          <div>
            <div className="text-[#351027]/50 uppercase font-bold text-[9px]">Height</div>
            <div className="font-extrabold text-[#351027]">170 CM</div>
          </div>
          <div>
            <div className="text-[#351027]/50 uppercase font-bold text-[9px]">Weight</div>
            <div className="font-extrabold text-[#351027]">64 KG</div>
          </div>
        </div>

        {/* Category Tag Chips */}
        <div className="space-y-2">
          <span className="block px-3 py-1 rounded-full bg-[#F3E8FC] text-xs font-bold text-[#351027] text-center border border-[#351027]">
            Moderately Active
          </span>
          <span className="block px-3 py-1 rounded-full bg-[#E0F5EE] text-xs font-bold text-[#351027] text-center border border-[#351027]">
            Vegetarian
          </span>
          <span className="block px-3 py-1 rounded-full bg-[#E8F1FC] text-xs font-bold text-[#351027] text-center border border-[#351027]">
            Controlled Asthma
          </span>
        </div>
      </div>
    </div>
  );
}
