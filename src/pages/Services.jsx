import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Cpu, Cloud, Database, Brain,
  GitMerge, Network, ShieldCheck, Wrench, Compass, Zap, Building2
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import TextReveal from '../components/anim/TextReveal';
import BannerDrawBorder from '../components/anim/BannerDrawBorder';
import Reveal from '../components/anim/Reveal';
import RichTextRenderer from '../components/RichTextRenderer';

function parseBulletPoints(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'string') return [String(data)];
  
  if (data.includes('\n- ') || data.includes('\n• ') || data.includes('\n* ')) {
    return data.split(/\n[-•*]\s+/).map(s => s.trim().replace(/^[-•*]\s+/, '')).filter(Boolean);
  }
  
  const sentences = data.split(/(?<=[.?!])\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
  return sentences.length > 0 ? sentences : [data];
}

function renderBulletText(text) {
  if (!text) return null;
  const clean = text.replace(/^\s*[-•*]\s+/, '').replace(/\*\*/g, '');
  const colonIdx = clean.indexOf(':');
  if (colonIdx > 0 && colonIdx < 45) {
    const title = clean.substring(0, colonIdx);
    const rest = clean.substring(colonIdx + 1);
    return (
      <p className="text-base md:text-[17px] text-text font-normal leading-[1.7] text-left">
        <strong className="text-text font-semibold">{title}:</strong>
        <span className="text-text font-normal"> {rest}</span>
      </p>
    );
  }
  return <p className="text-base md:text-[17px] text-text font-normal leading-[1.7] text-left">{clean}</p>;
}

export default function Services() {
  const { services: rawCmsServices, accelerators: rawAccelerators, caseStudies: rawCaseStudies, isLoaded } = useCMS() || {};
  const [activeIdx, setActiveIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const stageRef = useRef(null);
  const detailContainerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (detailContainerRef.current) {
      const rect = detailContainerRef.current.getBoundingClientRect();
      const navOffset = 85;
      const targetY = window.pageYOffset + rect.top - navOffset;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
    }
  }, [activeIdx]);

  const iconMap = {
    'ai-ml': Brain,
    'iiot-edge': Cpu,
    'devops-cloud': Cloud,
    'data-engineering': Database,
    'generative-ai': GitMerge,
    'data-governance': ShieldCheck,
    integration: Network,
    servicenow: Wrench,
    advisory: Compass,
    'ai-workflow': Zap
  };

  const services = useMemo(() => {
    if (!Array.isArray(rawCmsServices)) return [];
    return rawCmsServices.map((item, idx) => {
      const slugLower = (item.slug || item.id || '').toLowerCase();
      
      const linkedAcc = Array.isArray(rawAccelerators)
        ? rawAccelerators.find(acc => 
            acc.category?.toLowerCase().includes(slugLower) || 
            (acc.slug && acc.slug.includes(slugLower))
          )
        : null;

      const linkedCase = Array.isArray(rawCaseStudies)
        ? rawCaseStudies.find(cs => 
            cs.service?.toLowerCase() === item.title?.toLowerCase() ||
            cs.service?.toLowerCase() === slugLower ||
            (cs.slug && cs.slug.includes(slugLower))
          )
        : null;

      return {
        id: item.slug || item.id,
        slug: item.slug || item.id,
        num: String(idx + 1).padStart(2, '0'),
        title: item.title || item.name,
        icon: iconMap[slugLower] || Building2,
        tagline: item.summary || item.tagline || '',
        description: item.content || item.description || item.summary || '',
        businessProblems: parseBulletPoints(item.businessProblems || item.challenge || item.problemStatement || [
          'High operational friction caused by legacy system fragmentation.',
          'Lack of real-time visibility across critical enterprise workflows.',
          'Scaling bottlenecks preventing continuous digital transformation.'
        ]),
        capabilities: Array.isArray(item.capabilities) && item.capabilities.length > 0
          ? item.capabilities
          : (Array.isArray(item.key_solutions) ? item.key_solutions : [
              'Enterprise System Architecture',
              'Sub-Second Data Synchronization',
              'Automated Pipeline Monitoring',
              'Governance & Security Compliance'
            ]),
        technology: Array.isArray(item.technology) && item.technology.length > 0
          ? item.technology
          : (Array.isArray(item.techStack) && item.techStack.length > 0 ? item.techStack : ['Python', 'Docker', 'Kubernetes', 'React', 'PostgreSQL']),
        outcomes: item.outcomes || item.outcome || item.businessOutcomes || 'Delivers measurable operational efficiency, 99.9% uptime, and scalable enterprise performance.',
        accelerator: linkedAcc ? linkedAcc.name : (item.accelerator || 'Proprietary SMRIKAAM Asset'),
        caseStudy: linkedCase ? linkedCase.title : (item.caseStudy || `${item.title || item.name} Deployment Blueprint`),
        image: item.cover_image_url || item.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        caption: `${(item.title || item.name).toUpperCase()} — Architecture Blueprint`
      };
    });
  }, [rawCmsServices, rawAccelerators, rawCaseStudies]);

  // Preload images to eliminate flickers
  useEffect(() => {
    services.forEach((srv) => {
      if (srv.image) {
        const img = new Image();
        img.src = srv.image;
      }
    });
  }, [services]);

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const activeService = services[activeIdx] || services[0] || null;

  const rotateX = isHovered ? (0.5 - mousePos.y) * 4 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 4 : 0;
  const translateX = isHovered ? (mousePos.x - 0.5) * 10 : 0;
  const translateY = isHovered ? (mousePos.y - 0.5) * 10 : 0;

  return (
    <div className="relative z-10 pt-28 pb-24 text-text">
      {/* SECTION 01 — SERVICES HERO */}
      <section id="overview" data-scroll-label="SERVICES" className="px-6 md:px-16 max-w-7xl mx-auto mb-16">
        <div className="page-title-surface relative border border-border p-8 md:p-12 overflow-hidden">
          <BannerDrawBorder />
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold">
              CORE CAPABILITIES
            </div>
            <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1 bg-black/[0.02] dark:bg-white/[0.03]">
              TECHNICAL SERVICES
            </div>
          </div>

          <TextReveal
            text="ENTERPRISE ENGINEERING &amp; AI CAPABILITIES"
            as="h1"
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-[0.96] mb-4 max-w-5xl"
          />

          <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-3xl font-normal leading-[1.6] border-l-2 border-[var(--color-accent)] pl-4 text-left">
            SMRIKAAM delivers specialized software engineering, artificial intelligence, cloud modernization, and industrial automation solutions across global enterprise operations.
          </p>
        </div>
      </section>

      {/* SECTION 02 — THE SERVICE SYSTEM (Interactive Master-Detail Architecture) */}
      <section id="capabilities" data-scroll-label="SERVICE SYSTEM" className="px-6 md:px-16 max-w-7xl mx-auto mb-20">
        {services.length === 0 ? (
          <div className="page-title-surface border border-border p-12 text-center my-12">
            <div className="font-mono text-xs text-accent uppercase mb-2">SYSTEM STATUS</div>
            <h2 className="font-heading text-2xl font-bold uppercase text-text mb-2">NO PUBLISHED SERVICES CURRENTLY AVAILABLE</h2>
            <p className="text-text-muted text-sm max-w-md mx-auto">All services are currently in draft, undergoing maintenance, or archived.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start border-t border-border/70 pt-10">
            
            {/* Left Column: Services Selector List (Sticky Desktop Navigation) */}
            <aside className="lg:col-span-5 lg:sticky lg:top-20 self-start z-20">
              <div
                role="tablist"
                aria-label="Enterprise Services"
                className="page-title-surface border border-border overflow-hidden flex flex-col divide-y divide-border/70"
              >
              {services.map((srv, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={srv.id}
                    role="tab"
                    id={`service-tab-${srv.id}`}
                    aria-selected={isActive}
                    aria-controls={`service-panel-${srv.id}`}
                    tabIndex={0}
                    onClick={() => setActiveIdx(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveIdx(idx);
                      }
                    }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`service-tab-item group py-4 px-4 cursor-pointer flex items-start justify-between gap-4 outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                      isActive
                        ? 'active -ml-[1px]'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.015]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div>
                        <h3 className={`font-heading text-base md:text-lg font-bold tracking-tight transition-colors uppercase ${
                          isActive ? 'text-accent' : 'text-text/90 group-hover:text-accent'
                        }`}>
                          {srv.title}
                        </h3>
                        <p className="text-[13px] md:text-sm text-text-muted font-normal leading-[1.4] mt-1 line-clamp-1 max-w-md">
                          {srv.tagline}
                        </p>
                      </div>

                      <span
                        className={`text-sm shrink-0 mt-1 transition-transform duration-200 ${
                          isActive ? 'text-accent translate-x-1' : 'text-text-muted/40 group-hover:translate-x-1 group-hover:text-text-muted'
                        }`}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
              </div>
            </aside>

            {/* Right Column: Active Service Detailed Stage (Normal Document Scroll) */}
            {activeService && (
              <div ref={detailContainerRef} className="lg:col-span-7 min-w-0">
                <div
                  key={activeService.id}
                  role="tabpanel"
                  id={`service-panel-${activeService.id}`}
                  aria-labelledby={`service-tab-${activeService.id}`}
                  className="service-detail-panel p-6 md:p-8 space-y-6"
                >
                  
                  {/* Header: Title */}
                  <div className="border-b border-border/70 pb-5">
                    <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text tracking-tight uppercase">
                      {activeService.title}
                    </h2>
                  </div>

                  {/* Service Detailed Narrative */}
                  {activeService.description && (
                    <div className="text-[14px] md:text-[15px] font-normal text-text-muted leading-[1.6] text-left">
                      <RichTextRenderer content={activeService.description} />
                    </div>
                  )}

                  {/* Real Photograph with Parallax on Desktop */}
                  <div
                    ref={stageRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                      setIsHovered(false);
                      setMousePos({ x: 0.5, y: 0.5 });
                    }}
                    className="relative overflow-hidden aspect-video border border-border bg-black/5 dark:bg-white/5"
                  >
                    <img
                      src={activeService.image}
                      alt={activeService.title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 ease-out"
                      style={{
                        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0px)`
                      }}
                    />
                  </div>

                  {/* Business Problems Solved */}
                  <div>
                    <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-2.5 text-left">
                      BUSINESS PROBLEMS SOLVED
                    </h4>
                    <ul className="space-y-2">
                      {activeService.businessProblems.map((prob, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-base md:text-[17px] font-normal text-text leading-[1.7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" aria-hidden="true" />
                          <div>{renderBulletText(prob)}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Core Capabilities */}
                  <div>
                    <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-3 text-left">
                      CORE CAPABILITIES
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeService.capabilities.map((cap, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-[12px] md:text-[13px] text-text font-normal"
                        >
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technology Stack */}
                  <div>
                    <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-3 text-left">
                      MODERN TECHNOLOGY STACK
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {activeService.technology.map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1.5 bg-bg border border-border text-[12px] md:text-[13px] text-text font-normal"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Business Outcome */}
                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] border-l-2 border-accent">
                    <div className="text-[11px] text-accent uppercase tracking-[0.2em] font-semibold mb-1 text-left">
                      BUSINESS OUTCOME
                    </div>
                    <p className="text-[14px] md:text-[15px] text-text font-normal leading-[1.5] text-left">
                      {activeService.outcomes}
                    </p>
                  </div>

                  {/* Accelerator & Case Study Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/70 text-[13px]">
                    <div className="p-3.5 border border-border/70 flex flex-col justify-between">
                      <span className="text-[11px] text-text-muted font-normal uppercase tracking-wider mb-1.5 text-left">
                        ENGINEERED PRODUCT / ASSET
                      </span>
                      <Link to="/products" className="text-text font-semibold hover:text-accent transition-colors inline-flex items-center gap-1.5 group/acc">
                        <span>{activeService.accelerator}</span>
                        <span className="text-accent transition-transform duration-200 group-hover/acc:translate-x-1" aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <div className="p-3.5 border border-border/70 flex flex-col justify-between">
                      <span className="text-[11px] text-text-muted font-normal uppercase tracking-wider mb-1.5 text-left">
                        CASE STUDY / WORKBENCH
                      </span>
                      <Link to="/products" className="text-text font-medium hover:text-accent transition-colors inline-flex items-center gap-1.5 group/acc">
                        <span>{activeService.accelerator}</span>
                        <span className="text-accent transition-transform duration-200 group-hover/acc:translate-x-1" aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <div className="p-3.5 border border-border/70 flex flex-col justify-between">
                      <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1.5 text-left">
                        CASE STUDY / WORKBENCH
                      </span>
                      <Link to="/case-studies" className="text-text font-medium hover:text-accent transition-colors inline-flex items-center gap-1.5 group/cs">
                        <span className="line-clamp-1">{activeService.caseStudy}</span>
                        <span className="text-accent transition-transform duration-200 group-hover/cs:translate-x-1 shrink-0" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>

                  {/* Direct Specification & CTA Links */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/services/${activeService.slug}`}
                      className="admin-btn flex-1 py-3 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 text-text hover:text-accent"
                    >
                      <span>VIEW FULL SPECIFICATION</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/contact"
                      className="btn btn-primary flex-1 py-3 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2"
                    >
                      <span>DISCUSS THIS SERVICE</span>
                      <span className="arrow-hover" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 03 — END CTA BAND */}
      <section id="cta" data-scroll-label="STRATEGY CALL" className="px-6 md:px-16 max-w-7xl mx-auto mt-24">
        <Reveal variant="scale" className="border border-border p-10 md:p-14 text-center bg-bg/95 backdrop-blur-md">
          <div className="font-mono text-[12px] md:text-[13px] text-accent uppercase tracking-[0.14em] font-medium mb-3">
            ENGAGEMENT • TECHNOLOGY CONSULTATION
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase text-text mb-4">
            TALK TO OUR TECHNOLOGY TEAM
          </h2>
          <p className="text-text-muted text-[15px] md:text-[16px] font-normal max-w-xl mx-auto mb-8 leading-[1.6]">
            Discuss your engineering architecture, enterprise AI models, or industrial automation needs directly with our senior leads.
          </p>
          <Link to="/contact" className="btn btn-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
            <span>BOOK STRATEGY CALL</span>
            <span className="arrow-hover" aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
