import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MedicinePillMascot from './MedicinePillMascot';
import { initCTAPhoneRise } from '../animations/motionPresets';
import SectionDivider from './SectionDivider';

interface CTASectionProps {
  onOpenDemo?: () => void;
}

export default function CTASection({ onOpenDemo }: CTASectionProps) {
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    initCTAPhoneRise(ctaRef.current);
  }, []);

  return (
    <section
      ref={ctaRef}
      className="bg-[#F52F4F] border-t-[3.5px] border-[#351027] pt-16 sm:pt-24 pb-0 text-center relative overflow-hidden -mx-4 sm:-mx-8"
    >
      <div className="max-w-4xl mx-auto space-y-6 px-4 relative z-10">
        {/* Cute Mascot */}
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-200">
          <MedicinePillMascot size={64} mood="sparkle" sparkles={true} />
        </div>

        <h2 className="heading-chunky text-4xl sm:text-6xl text-[#351027] tracking-tight">
          The Future of Healthcare
        </h2>

        <p className="text-base sm:text-lg text-[#351027]/90 max-w-xl mx-auto font-medium leading-relaxed">
          Explore our project deliverables, interactive prototype demos, and full software architecture.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/presentation/v1"
            className="btn-tactile btn-tactile-gold"
          >
            <span className="btn-tactile-inner text-xs sm:text-sm px-7 py-3 shadow-tactile font-display font-extrabold">
              LAUNCH PLANNING PRESENTATION V1
            </span>
          </Link>

          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn-tactile btn-tactile-white"
            >
              <span className="btn-tactile-inner text-xs sm:text-sm px-7 py-3 shadow-tactile font-display font-extrabold text-[#F52F4F]">
                TRY LIVE PROTOTYPE DEMO
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Rising Mockup Phones pay-off ─────────────────────────────────── */}
      <div
        data-anim="cta-phones"
        className="mt-12 sm:mt-16 flex justify-center items-end relative z-0 transform-gpu"
      >
        <div className="w-80 sm:w-96 h-28 sm:h-36 bg-[#FFF8E8] border-t-[3.5px] border-x-[3.5px] border-[#351027] rounded-t-4xl shadow-tactile-xl flex flex-col items-center justify-center font-display font-extrabold text-xs sm:text-sm text-[#351027] space-y-1">
          <div className="w-12 h-1.5 bg-[#351027] rounded-full mb-1" />
          <span>Pharmacon Prototyping Engine Active</span>
          <span className="text-[10px] text-[#351027]/60 font-medium">Verified Healthcare Platform</span>
        </div>
      </div>
    </section>
  );
}
