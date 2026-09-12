import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  FileText, ShieldCheck, Database, Server, RefreshCw, Zap,
  CheckCircle, ArrowRight, Activity, Heart, Sparkles, Plus,
  Layers, Users, Stethoscope, ChevronRight, BarChart3, AlertCircle
} from 'lucide-react';
import MedicinePillMascot from '../components/MedicinePillMascot';
import SectionDivider from '../components/SectionDivider';
import PhoneShowcase from '../components/PhoneShowcase';
import ConnectorDiagram from '../components/ConnectorDiagram';
import ProfileCards from '../components/ProfileCards';
import CTASection from '../components/CTASection';
import {
  initHeroEntrance,
  initPhoneScrollShowcase,
  initLayerStackSeparation,
  initEditorialReveals
} from '../animations/motionPresets';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  skills?: string;
  color?: string;
  badgeColor?: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'T-001',
    name: 'Aryan Sharma',
    role: 'Frontend Lead',
    focus: 'UI/UX architecture, responsive design system, tactile component library, and interactive presentations.',
    avatar: 'AS',
    skills: 'React, TypeScript, Tailwind, Recharts',
    color: '#FFE8ED',
    badgeColor: '#F52F4F',
  },
  {
    id: 'T-002',
    name: 'Aniket Raj',
    role: 'Backend Lead',
    focus: 'Express API development, database persistence, S3/Supabase storage integrations, and permanent version publishing engine.',
    avatar: 'AR',
    skills: 'Node.js, Express, SQLite, S3, REST APIs',
    color: '#E0F5EE',
    badgeColor: '#059669',
  },
  {
    id: 'T-003',
    name: 'Amitesh Kumar Singh',
    role: 'AI / CV Engineer',
    focus: 'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.',
    avatar: 'AK',
    skills: 'Python, PyTorch, Computer Vision, OCR, CNN-Transformers',
    color: '#FFF0C8',
    badgeColor: '#D97706',
  },
  {
    id: 'T-004',
    name: 'Chirag Lamba',
    role: 'Integration Lead',
    focus: 'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.',
    avatar: 'CL',
    skills: 'CI/CD, GitHub Actions, System Integration, Testing, Security Audit',
    color: '#F3E8FC',
    badgeColor: '#9333EA',
  },
];

export default function HomePage() {
  const [team, setTeam] = useState(DEFAULT_TEAM);

  const homeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const phoneSectionRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTeam = () => {
      const cached = localStorage.getItem('pharmacon_team_members');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.length > 0) {
            setTeam(parsed.map((m: any, i: number) => ({
              ...m,
              color: DEFAULT_TEAM[i % 4].color,
              badgeColor: DEFAULT_TEAM[i % 4].badgeColor,
            })));
          }
        } catch (e) {}
      }

      api.get<{ members: TeamMember[] }>('/team')
        .then((data) => {
          if (data.members && data.members.length > 0) {
            const currentCache = localStorage.getItem('pharmacon_team_members');
            let baseList = data.members;
            if (currentCache) {
              try {
                const localList = JSON.parse(currentCache);
                baseList = data.members.map((serverM) => {
                  const localM = localList.find((l: any) => l.id === serverM.id);
                  return localM ? { ...serverM, ...localM } : serverM;
                });
              } catch (e) {}
            }
            setTeam(baseList.map((m: any, i: number) => ({
              ...m,
              color: DEFAULT_TEAM[i % 4].color,
              badgeColor: DEFAULT_TEAM[i % 4].badgeColor,
            })));
          }
        })
        .catch(() => {});
    };

    loadTeam();
    window.addEventListener('pharmacon_team_updated', loadTeam);
    return () => window.removeEventListener('pharmacon_team_updated', loadTeam);
  }, []);

  // Motion Choreography Initialization
  useEffect(() => {
    initHeroEntrance(heroRef.current);
    initPhoneScrollShowcase(phoneSectionRef.current);
    initLayerStackSeparation(layerRef.current);
    initEditorialReveals(homeRef.current);
  }, []);

  return (
    <div ref={homeRef} className="space-y-20 sm:space-y-32 pb-0 overflow-hidden">
      {/* ─── 1. Hero Section ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="pt-6 sm:pt-10 px-4 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8"
      >
        {/* Cute Medicine Pill Mascot Icon */}
        <div data-anim="hero-mascot" className="flex justify-center">
          <div className="relative w-20 h-20 rounded-full bg-[#F52F4F] border-[3px] border-[#351027] flex items-center justify-center shadow-tactile transform hover:scale-105 transition-transform">
            <MedicinePillMascot size={50} mood="happy" sparkles={true} />
          </div>
        </div>

        {/* Introducing Pill Tag */}
        <div data-anim="hero-badge">
          <span className="pill-tag-dark uppercase tracking-wider px-5 py-2">
            Connected Healthcare Intelligence
          </span>
        </div>

        {/* Massive Chunky 2-Line Heading */}
        <h1
          data-anim="hero-title"
          className="heading-chunky text-4xl sm:text-6xl lg:text-7xl max-w-4xl mx-auto"
        >
          Finally, Really <br className="hidden sm:inline" />
          Intelligent Healthcare
        </h1>

        {/* Editorial Subtitle Paragraph */}
        <p
          data-anim="hero-subtitle"
          className="text-base sm:text-xl text-[#351027]/80 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Subscription-based predictive healthcare connecting handwritten prescriptions to verified care, because disconnected paper records are out of touch, out of date, and out of time.
        </p>

        {/* ─── Large Product Triple-Phone Showcase ────────────────────────── */}
        <div ref={phoneSectionRef}>
          <PhoneShowcase />
        </div>
      </section>

      {/* Layered Section Divider */}
      <SectionDivider variant="pink-stepped" />

      {/* ─── 2. Section: Disconnected Prescriptions & Connector Diagram ──── */}
      <section data-anim-section className="px-4 sm:px-8 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5 text-left">
          <span data-anim-badge className="pill-tag">Subscriptions, not premiums</span>
          <h2 data-anim-heading className="heading-chunky text-4xl sm:text-5xl">
            The end of Disconnected <br />
            Medical Prescriptions?
          </h2>
          <p data-anim-paragraph className="text-base sm:text-lg text-[#351027]/80 leading-relaxed font-medium">
            Paper prescriptions are decades out of date, error-prone, and delay patient recovery. We’re building the intelligent prescription verification network that keeps clinics, pharmacists, and patients completely in sync.
          </p>
        </div>

        {/* Central Pill Node & Connector Diagram */}
        <ConnectorDiagram />
      </section>

      {/* Layered Section Divider */}
      <SectionDivider variant="burgundy-stepped" />

      {/* ─── 3. Section: Caring About You & Profile Cards ───────────────── */}
      <section data-anim-section className="px-4 sm:px-8 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Floating Profile Infographic Cards */}
        <ProfileCards />

        {/* Right: Editorial Copy */}
        <div className="space-y-5 text-left">
          <span data-anim-badge className="pill-tag-gold">Connected Intelligence</span>
          <h2 data-anim-heading className="heading-chunky text-4xl sm:text-5xl">
            Caring about you, <br />
            before you need it.
          </h2>
          <p data-anim-paragraph className="text-base sm:text-lg text-[#351027]/80 leading-relaxed font-medium">
            Traditional pharmacy workflows react only after you stand in line with a paper slip. Pharmacon continuously syncs digitized doctor orders, cross-references formulary inventories, and predicts refill timings automatically.
          </p>

          <div className="pt-2">
            <Link to="/presentation/v1" className="btn-tactile btn-tactile-dark">
              <span className="btn-tactile-inner py-2 px-6 text-xs font-display font-extrabold flex items-center gap-2">
                <span>EXPLORE PLANNING V1</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Layered Section Divider */}
      <SectionDivider variant="pink-stepped" />

      {/* ─── 4. Section: Stacked Physical Cards & Architecture Stack ─────── */}
      <section ref={layerRef} data-anim-section className="px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span data-anim-badge className="pill-tag-dark">System Architecture</span>
          <h2 data-anim-heading className="heading-chunky text-4xl sm:text-5xl">
            Built on a Modern, Connected Foundation
          </h2>
          <p data-anim-paragraph className="text-sm sm:text-base text-[#351027]/70 font-medium">
            A secure full-stack platform uniting real-time doctor calibration, automated digitisation, and public immutable deliverable archives.
          </p>
        </div>

        {/* 4 Feature Layer Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div data-anim="layer-card" className="card-tactile p-6 space-y-3 bg-[#FFE8ED] border-2 border-[#351027]">
            <div className="w-10 h-10 rounded-2xl bg-[#F52F4F] border-2 border-[#351027] flex items-center justify-center text-white shadow-tactile-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-[#351027]">1. Adaptive OCR</h3>
            <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
              Ensemble CNN-Transformer trained with 3-sheet writer adaptation per practitioner for handwriting accuracy.
            </p>
          </div>

          <div data-anim="layer-card" className="card-tactile p-6 space-y-3 bg-[#E0F5EE] border-2 border-[#351027]">
            <div className="w-10 h-10 rounded-2xl bg-[#059669] border-2 border-[#351027] flex items-center justify-center text-white shadow-tactile-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-[#351027]">2. Human Review</h3>
            <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
              Confidence threshold routing flags uncertain dosage fields directly to pharmacist verification queues.
            </p>
          </div>

          <div data-anim="layer-card" className="card-tactile p-6 space-y-3 bg-[#FFF0C8] border-2 border-[#351027]">
            <div className="w-10 h-10 rounded-2xl bg-[#D97706] border-2 border-[#351027] flex items-center justify-center text-white shadow-tactile-sm">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-[#351027]">3. Cloud Sync</h3>
            <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
              Hybrid SQLite local node paired with Supabase PostgreSQL and S3 cloud storage for public deliverable hosting.
            </p>
          </div>

          <div data-anim="layer-card" className="card-tactile p-6 space-y-3 bg-[#F3E8FC] border-2 border-[#351027]">
            <div className="w-10 h-10 rounded-2xl bg-[#9333EA] border-2 border-[#351027] flex items-center justify-center text-white shadow-tactile-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-[#351027]">4. Version Control</h3>
            <p className="text-xs text-[#351027]/70 font-medium leading-relaxed">
              Automated version promotion archives previous decks while maintaining permanent deliverable histories.
            </p>
          </div>
        </div>
      </section>

      {/* Layered Section Divider */}
      <SectionDivider variant="burgundy-stepped" />

      {/* ─── 5. Section: Team Pharmacon ─────────────────────────────────── */}
      <section data-anim-section className="px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span data-anim-badge className="pill-tag-pink">Core Team</span>
            <h2 data-anim-heading className="heading-chunky text-3xl sm:text-4xl mt-2">
              Meet the Engineers
            </h2>
          </div>
          <Link to="/team" className="btn-tactile btn-tactile-white">
            <span className="btn-tactile-inner py-1.5 px-4 text-xs font-extrabold flex items-center gap-1.5">
              <span>View Full Team & Admin Edit</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F52F4F]" />
            </span>
          </Link>
        </div>

        {/* Team Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {team.map((member) => {
            const isPhoto = member.avatar && (member.avatar.startsWith('data:image') || member.avatar.startsWith('http'));
            return (
              <div
                key={member.id}
                data-anim-card
                className="card-tactile p-6 space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform"
                style={{ backgroundColor: member.color || '#FFFFFF' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {isPhoto ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-[3px] border-[#351027] shadow-tactile bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-[3px] border-[#351027] flex items-center justify-center font-display font-black text-xl text-[#351027] shadow-tactile">
                        {member.avatar}
                      </div>
                    )}
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white border border-[#351027] shadow-tactile-sm"
                      style={{ backgroundColor: member.badgeColor || '#F52F4F' }}
                    >
                      {member.role}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-lg text-[#351027]">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#351027]/80 font-medium leading-relaxed mt-2">
                    {member.focus}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#351027]/10 flex items-center justify-between">
                  <Link
                    to="/team"
                    className="text-[11px] font-bold text-[#F52F4F] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Edit Profile</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 6. Large Red CTA Section with Stepped Header and Phone Rise ─── */}
      <CTASection />
    </div>
  );
}
