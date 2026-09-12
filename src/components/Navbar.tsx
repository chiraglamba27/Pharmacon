import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Sparkles, User, Stethoscope, Briefcase,
  Layers, Info, FileText, ArrowRight, ShieldCheck,
  Building2, UserCheck, Heart, KeyRound, LogOut
} from 'lucide-react';
import MedicinePillMascot from './MedicinePillMascot';
import BrandWordmark from './BrandWordmark';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* ─── Topmost Dashboard Header Bar (Exact Reference Layout) ──────── */}
      <header className="sticky top-0 z-50 w-full pt-4 sm:pt-6 px-3 sm:px-6 pointer-events-none transition-all duration-200">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          {/* Top Control Strip with Buttons and Central 3D Bubble Wordmark */}
          <div className="relative z-30 flex items-center justify-between px-2 sm:px-4 mb-[-26px] sm:mb-[-36px]">
            {/* Left Button: ≡ LEARN MORE */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white border-[3px] border-[#351027] rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 shadow-[0_4px_0_#351027] hover:shadow-[0_2px_0_#351027] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer flex items-center gap-2 text-[#351027]"
              aria-label="Toggle Menu"
            >
              {menuOpen ? (
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EE3858]" />
              ) : (
                <div className="flex flex-col gap-[3px] w-3.5 sm:w-4">
                  <span className="w-full h-[2.5px] bg-[#351027] rounded-full" />
                  <span className="w-full h-[2.5px] bg-[#351027] rounded-full" />
                  <span className="w-full h-[2.5px] bg-[#351027] rounded-full" />
                </div>
              )}
              <span className="text-[11px] sm:text-xs font-display font-black tracking-wider uppercase text-[#351027]">
                {menuOpen ? 'CLOSE MENU' : 'LEARN MORE'}
              </span>
            </button>

            {/* Center: Custom Illustrated 3D Vector Wordmark */}
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto z-40"
            >
              <BrandWordmark size="md" />
            </Link>

            {/* Right Buttons: Planning V1 & Sign In */}
            <div className="flex items-center gap-2">
              <Link
                to="/presentation/v1"
                onClick={() => setMenuOpen(false)}
                className="bg-[#730F34] border-[3px] border-[#351027] rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 shadow-[0_4px_0_#351027] hover:shadow-[0_2px_0_#351027] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all text-white text-[11px] sm:text-xs font-display font-black tracking-wider uppercase hidden md:inline-flex"
              >
                PLANNING V1
              </Link>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-[#FFF0C8] border-[3px] border-[#351027] rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 shadow-[0_4px_0_#351027] hover:shadow-[0_2px_0_#351027] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all text-[#351027] text-[11px] sm:text-xs font-display font-black tracking-wider uppercase flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#F52F4F]" />
                <span>{isAuthenticated && user ? user.name.split(' ')[0] : 'SIGN IN'}</span>
              </Link>
            </div>
          </div>

          {/* Stepped Layered Rounded Banner Header (Exact Reference Strip with 4 Bands) */}
          <div className="relative w-full overflow-hidden rounded-t-[2.2rem] sm:rounded-t-[3rem] border-t-[3.5px] border-x-[3.5px] border-[#351027] z-10 bg-[#FFF8E8]">
            {/* Band 2: Soft/Bright Coral Pink (#FF6682) */}
            <div className="h-7 sm:h-9 bg-[#FF6682] w-full border-b-[3px] border-[#351027]" />

            {/* Band 3: Saturated Pink/Red (#EE3858) */}
            <div className="h-6 sm:h-8 bg-[#EE3858] w-full border-b-[3px] border-[#351027]" />

            {/* Band 4: Deep Burgundy/Red (#A90F39) */}
            <div className="h-5 sm:h-7 bg-[#A90F39] w-full" />
          </div>
        </div>
      </header>

      {/* ─── Mega Menu Overlay (Unfolding Floating Card Over Product) ───── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#351027]/40 backdrop-blur-sm flex items-start justify-center pt-24 sm:pt-28 px-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#EE3858] border-[3.5px] border-[#351027] rounded-4xl p-5 sm:p-8 max-w-5xl w-full shadow-tactile-xl relative animate-in zoom-in-95 duration-200 space-y-5">
            {/* Top Menu Controls Row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMenuOpen(false)}
                className="btn-tactile btn-tactile-white"
              >
                <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-2 text-[#EE3858]">
                  <X className="w-4 h-4" />
                  <span>CLOSE MENU</span>
                </span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-tactile btn-tactile-gold"
                >
                  <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isAuthenticated && user ? `Signed in (${user.role})` : 'SIGN IN / RBAC PORTALS'}</span>
                  </span>
                </Link>

                <Link
                  to="/prototype"
                  onClick={() => setMenuOpen(false)}
                  className="btn-tactile btn-tactile-dark hidden sm:inline-flex"
                >
                  <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold">
                    INTERACTIVE PROTOTYPE
                  </span>
                </Link>
              </div>
            </div>

            {/* ─── Dedicated Role Workspaces Quick Bar ──────────────────────── */}
            <div className="bg-[#351027] rounded-2xl p-3 sm:p-4 border-2 border-[#351027] text-white flex flex-wrap items-center justify-between gap-2 shadow-tactile-sm">
              <div className="flex items-center gap-2">
                <MedicinePillMascot size={22} mood="smart" />
                <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#FF6682]">
                  Role Workspaces:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <Link
                  to="/dashboard/doctor"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#EE3858] transition-colors flex items-center gap-1.5 text-white"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#FF6682]" />
                  <span>Doctor</span>
                </Link>
                <Link
                  to="/dashboard/pharmacy"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#EE3858] transition-colors flex items-center gap-1.5 text-white"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#FECB66]" />
                  <span>Pharmacy</span>
                </Link>
                <Link
                  to="/dashboard/clinic"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#EE3858] transition-colors flex items-center gap-1.5 text-white"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#97D8C4]" />
                  <span>Clinic Staff</span>
                </Link>
                <Link
                  to="/dashboard/patient"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#EE3858] transition-colors flex items-center gap-1.5 text-white"
                >
                  <Heart className="w-3.5 h-3.5 text-[#FF6682]" />
                  <span>Patient</span>
                </Link>
                <Link
                  to="/admin/publish"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-1 rounded-xl bg-[#FFF8E8] text-[#351027] font-extrabold hover:bg-[#FFE8ED] transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F52F4F]" />
                  <span>Admin</span>
                </Link>
              </div>
            </div>

            {/* 4-Column Large Editorial Cards Panel */}
            <div className="bg-[#FFF8E8] border-[3px] border-[#351027] rounded-3xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-tactile">
              {/* Column 1: Features (Tall Card) */}
              <Link
                to="/proposed-system"
                onClick={() => setMenuOpen(false)}
                onMouseEnter={() => setHoveredTile(1)}
                onMouseLeave={() => setHoveredTile(null)}
                className={`p-6 rounded-2xl border-2 border-[#351027] flex flex-col justify-between transition-all duration-200 group min-h-[200px] shadow-tactile-sm ${hoveredTile === 1 ? 'bg-[#FFE8ED] -translate-y-1' : 'bg-white'}`}
              >
                <div className="w-11 h-11 rounded-full bg-[#EE3858] border-2 border-[#351027] flex items-center justify-center text-white shadow-tactile-sm">
                  <MedicinePillMascot size={26} mood="sparkle" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#351027] group-hover:text-[#EE3858] mb-1">
                    Features & Scope
                  </h3>
                  <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
                    Doctor-adaptive OCR, confidence scoring, and connected formulary intelligence.
                  </p>
                </div>
              </Link>

              {/* Column 2: Stacked Cards (For Patients & For Doctors) */}
              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard/patient"
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setHoveredTile(2)}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={`p-4 rounded-2xl border-2 border-[#351027] transition-all duration-200 flex-1 flex flex-col justify-between group shadow-tactile-sm ${hoveredTile === 2 ? 'bg-[#FFE8ED] -translate-y-1' : 'bg-white'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] border border-[#351027] flex items-center justify-center text-[#351027]/70 mb-1">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-[#351027] group-hover:text-[#EE3858]">
                      Patient Portal
                    </h4>
                    <p className="text-[11px] text-[#351027]/70 font-medium">Verified dosage tracking & refills.</p>
                  </div>
                </Link>

                <Link
                  to="/dashboard/doctor"
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setHoveredTile(3)}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={`p-4 rounded-2xl border-2 border-[#351027] transition-all duration-200 flex-1 flex flex-col justify-between group shadow-tactile-sm ${hoveredTile === 3 ? 'bg-[#FFD3DC] -translate-y-1' : 'bg-[#FFE8ED]'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#EE3858] border border-[#351027] flex items-center justify-center text-white mb-1">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-[#351027]">
                      Doctor Portal
                    </h4>
                    <p className="text-[11px] text-[#351027]/70 font-medium">Prescriptions & handwriting calibration.</p>
                  </div>
                </Link>
              </div>

              {/* Column 3: Stacked Cards (For Pharmacies & Versions) */}
              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard/pharmacy"
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setHoveredTile(4)}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={`p-4 rounded-2xl border-2 border-[#351027] transition-all duration-200 flex-1 flex flex-col justify-between group shadow-tactile-sm ${hoveredTile === 4 ? 'bg-[#FFE8ED] -translate-y-1' : 'bg-white'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] border border-[#351027] flex items-center justify-center text-[#351027]/70 mb-1">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-[#351027] group-hover:text-[#EE3858]">
                      Pharmacy Portal
                    </h4>
                    <p className="text-[11px] text-[#351027]/70 font-medium">Real-time formulary SKU & stock sync.</p>
                  </div>
                </Link>

                <Link
                  to="/versions"
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setHoveredTile(5)}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={`p-4 rounded-2xl border-2 border-[#351027] transition-all duration-200 flex-1 flex flex-col justify-between group shadow-tactile-sm ${hoveredTile === 5 ? 'bg-[#FFE8ED] -translate-y-1' : 'bg-white'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFF8E8] border border-[#351027] flex items-center justify-center text-[#351027]/70 mb-1">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-[#351027] group-hover:text-[#EE3858]">
                      Version Archive
                    </h4>
                    <p className="text-[11px] text-[#351027]/70 font-medium">Immutable deliverables & logs.</p>
                  </div>
                </Link>
              </div>

              {/* Column 4: Why Pharmacon (Tall Card) */}
              <Link
                to="/presentation/v1"
                onClick={() => setMenuOpen(false)}
                onMouseEnter={() => setHoveredTile(6)}
                onMouseLeave={() => setHoveredTile(null)}
                className={`p-6 rounded-2xl border-2 border-[#351027] flex flex-col justify-between transition-all duration-200 group min-h-[200px] shadow-tactile-sm ${hoveredTile === 6 ? 'bg-[#FFE8ED] -translate-y-1' : 'bg-white'}`}
              >
                <div className="w-11 h-11 rounded-full bg-[#FFF8E8] border-2 border-[#351027] flex items-center justify-center text-[#351027]/70 shadow-tactile-sm">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#351027] group-hover:text-[#EE3858] mb-1">
                    Why Pharmacon
                  </h3>
                  <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
                    Connecting paper prescriptions to automated care without transcription errors.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
