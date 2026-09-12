import React from 'react';
import { Link } from 'react-router-dom';
import MedicinePillMascot from './MedicinePillMascot';

export default function Footer() {
  return (
    <footer className="bg-[#351027] border-t-2 border-[#351027] text-[#FFF8E8] p-6 sm:p-10 text-xs font-display font-bold">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <MedicinePillMascot size={28} mood="happy" />
          <span className="text-base font-extrabold text-[#FFF8E8]">pharmacon</span>
        </div>

        <div className="text-center text-white/70 font-medium">
          © Copyright Team Pharmacon 2026. Software Engineering Project · All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <Link to="/login" className="hover:text-[#FF6F89] transition-colors text-[#FECB66]">
            ROLE PORTALS & SIGN IN
          </Link>
          <Link to="/presentation/v1" className="hover:text-[#FF6F89] transition-colors">
            PRIVACY POLICY
          </Link>
          <Link to="/versions" className="hover:text-[#FF6F89] transition-colors">
            TERMS & CONDITIONS
          </Link>
        </div>
      </div>
    </footer>
  );
}
