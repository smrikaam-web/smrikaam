import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Cpu, Cloud, Database, Network,
  Zap
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

function parseFlowSteps(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text;
  if (typeof text !== 'string') return [String(text)];
  if (text.includes('→')) return text.split('→').map(s => s.trim()).filter(Boolean);
  if (text.includes('->')) return text.split('->').map(s => s.trim()).filter(Boolean);
  if (text.includes('\n')) return text.split('\n').map(s => s.trim().replace(/^[-•*]\s+/, '')).filter(Boolean);
  return [text];
}

function parseArchitectureComponents(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text;
  if (typeof text !== 'string') return [String(text)];
  if (text.includes('+')) return text.split('+').map(s => s.trim().replace(/\.$/, '')).filter(Boolean);
  if (text.includes('\n')) return text.split('\n').map(s => s.trim().replace(/^[-•*]\s+/, '')).filter(Boolean);
  return [text];
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

export default function Products() {
  const { accelerators: rawCmsProducts, caseStudies: rawCaseStudies, isLoaded } = useCMS() || {};
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
    bitxhift: Cpu,
    migratemax: Cloud,
    parsemaster: Database,
    linkgenx: Network
  };

  const products = useMemo(() => {
    if (!Array.isArray(rawCmsProducts)) return [];
    return rawCmsProducts.map((item, idx) => {
      const slugLower = (item.slug || item.id || '').toLowerCase();
      const linkedCase = Array.isArray(rawCaseStudies)
        ? rawCaseStudies.find(cs =>
            cs.accelerator?.toLowerCase() === item.name?.toLowerCase() ||
            cs.accelerator?.toLowerCase() === slugLower ||
            (cs.slug && cs.slug.includes(slugLower))
          )
        : null;

      return {
        id: item.slug || item.id,
        slug: item.slug || item.id,
        num: String(idx + 1).padStart(2, '0'),
        title: item.name || item.title,
        icon: iconMap[slugLower] || Zap,
        category: item.category || 'REUSABLE ENGINEERING ASSET',
        tagline: item.tagline || item.shortDescription || '',
        description: item.fullDescription || item.shortDescription || item.description || '',
        problem: item.problem || item.problemStatement || '',
        problemPoints: parseBulletPoints(item.problem || item.problemStatement || [
          'Operational Unpredictability: High scrap rates and unpredicted machinery faults causing costly downtime.',
          'Legacy Protocol Fragmentation: Inability to bridge heterogeneous PLC architectures to unified telemetry streams.',
          'Data Latency Overhead: Sluggish cloud-dependent architectures that compromise sub-second edge operations.'
        ]),
        solution: item.solution || item.solutionStatement || 'Standardized edge intelligence engine delivering sub-second anomaly detection, local protocol normalization, and autonomous offline operations.',
        howItWorks: item.howItWorks || 'Edge Telemetry → Signal Normalization → Stream Processing → Unified Dashboard',
        flowSteps: parseFlowSteps(item.howItWorks || 'Edge Telemetry → Signal Normalization → Stream Processing → Unified Dashboard'),
        architecture: item.architecture || 'OPC-UA Collector + Node-RED Middleware + TimescaleDB Engine + React Mesh',
        archComponents: parseArchitectureComponents(item.architecture || 'OPC-UA Collector + Node-RED Middleware + TimescaleDB Engine + React Mesh'),
        capabilities: Array.isArray(item.keyFeatures) && item.keyFeatures.length > 0
          ? item.keyFeatures
          : (Array.isArray(item.keyCapabilities) ? item.keyCapabilities : [
              'Real-Time OEE Calculation',
              'Vibration Anomaly Detection',
              'Energy Load Optimization',
              'Automated Shift Reporting'
            ]),
        technology: Array.isArray(item.technology) && item.technology.length > 0
          ? item.technology
          : ['MQTT', 'OPC-UA', 'Node-RED', 'TimescaleDB', 'Docker Edge', 'React', 'Python', 'Grafana'],
        outcomes: item.businessOutcomes || item.outcomes || '35% reduction in unplanned downtime and 60% faster deployment across distributed industrial plants.',
        caseStudy: linkedCase ? linkedCase.title : (item.caseStudy || `${item.name || item.title} Enterprise Deployment`),
        caseStudySlug: linkedCase ? linkedCase.slug : null,
        image: item.cover_image_url || item.image || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
        caption: `${(item.name || item.title).toUpperCase()} — Production Engineering Specification`
      };
    });
  }, [rawCmsProducts, rawCaseStudies]);

  // Preload images to eliminate flickers
  useEffect(() => {
    products.forEach((prod) => {
      if (prod.image) {
        const img = new Image();
        img.src = prod.image;
      }
    });
  }, [products]);

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const activeProduct = products[activeIdx] || products[0] || null;

  const rotateX = isHovered ? (0.5 - mousePos.y) * 4 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 4 : 0;
  const translateX = isHovered ? (mousePos.x - 0.5) * 10 : 0;
  const translateY = isHovered ? (mousePos.y - 0.5) * 10 : 0;

  return (
    <div className="relative z-10 pt-28 pb-24 text-text">
      {/* SECTION 01 — PRODUCTS HERO */}
      <section id="overview" data-scroll-label="PRODUCTS" className="px-6 md:px-16 max-w-7xl mx-auto mb-16">
        <div className="page-title-surface relative border border-border p-8 md:p-12 overflow-hidden">
          <BannerDrawBorder />
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold">
              PRODUCTS &amp; ENGINEERING ASSETS
            </div>
            <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1 bg-black/[0.02] dark:bg-white/[0.03]">
              ENTERPRISE PRODUCTS
            </div>
          </div>

          <TextReveal
            text="ENGINEERED PRODUCTS FOR ENTERPRISE TRANSFORMATION"
            as="h1"
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-[0.96] mb-4 max-w-5xl"
          />

          <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-3xl font-normal leading-[1.6] border-l-2 border-[var(--color-accent)] pl-4 text-left">
            SMRIKAAM proprietary engineering assets and reusable accelerators reduce enterprise deployment timelines by up to 60%.
          </p>
        </div>
      </section>

      {/* SECTION 02 — THE PRODUCT SYSTEM (Interactive Master-Detail Architecture) */}
      <section id="capabilities" data-scroll-label="PRODUCT SYSTEM" className="px-6 md:px-16 max-w-7xl mx-auto mb-20">
        {products.length === 0 ? (
          <div className="page-title-surface border border-border p-12 text-center my-12">
            <div className="font-mono text-xs text-accent uppercase mb-2">SYSTEM STATUS</div>
            <h2 className="font-heading text-2xl font-bold uppercase text-text mb-2">NO PUBLISHED PRODUCTS CURRENTLY AVAILABLE</h2>
            <p className="text-text-muted text-sm max-w-md mx-auto">All products are currently in draft, undergoing maintenance, or archived.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start border-t border-border/70 pt-10">
            
            {/* Left Column: Products Selector List (Sticky Desktop Navigation) */}
            <aside className="lg:col-span-5 lg:sticky lg:top-20 self-start z-20">
              <div
                role="tablist"
                aria-label="Enterprise Products"
                className="page-title-surface border border-border overflow-hidden flex flex-col divide-y divide-border/70"
              >
              {products.map((prod, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={prod.id}
                    role="tab"
                    id={`product-tab-${prod.id}`}
                    aria-selected={isActive}
                    aria-controls={`product-panel-${prod.id}`}
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
                    <div>
                      <h3 className={`font-heading text-base md:text-lg font-bold tracking-tight transition-colors uppercase ${
                        isActive ? 'text-accent' : 'text-text/90 group-hover:text-accent'
                      }`}>
                        {prod.title}
                      </h3>
                      <p className="text-[13px] md:text-sm text-text-muted font-normal leading-[1.4] mt-1 line-clamp-1 max-w-md">
                        {prod.tagline}
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
                );
              })}
              </div>
            </aside>

            {/* Right Column: Active Product Detailed Specification Stage (Normal Document Scroll) */}
            {activeProduct && (
              <div ref={detailContainerRef} className="lg:col-span-7 min-w-0">
                <div
                  key={activeProduct.id}
                  role="tabpanel"
                  id={`product-panel-${activeProduct.id}`}
                  aria-labelledby={`product-tab-${activeProduct.id}`}
                  className="service-detail-panel p-6 md:p-8 space-y-6"
                >
                  
                  {/* Header: Title */}
                  <div className="border-b border-border/70 pb-5">
                    <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text tracking-tight uppercase">
                      {activeProduct.title}
                    </h2>
                  </div>

                  {/* Product Detailed Narrative */}
                  {activeProduct.description && (
                    <div className="text-[14px] md:text-[15px] font-normal text-text-muted leading-[1.6] text-left">
                      <RichTextRenderer content={activeProduct.description} />
                    </div>
                  )}

                  {/* Real Photograph with Parallax on Desktop */}
                  {activeProduct.image && (
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
                        src={activeProduct.image}
                        alt={activeProduct.title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 ease-out"
                        style={{
                          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0px)`
                        }}
                      />
                    </div>
                  )}

                  {/* PROBLEM SOLVED & SOLUTION PROVIDED */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col h-full">
                      <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-2.5 text-left">
                        PROBLEM SOLVED
                      </h4>
                      <div className="subtle-readable-surface p-4 border border-border flex-1 flex flex-col justify-center">
                        {activeProduct.problemPoints && activeProduct.problemPoints.length > 1 ? (
                          <ul className="space-y-2">
                            {activeProduct.problemPoints.map((prob, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-base md:text-[17px] font-normal text-text leading-[1.7]">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" aria-hidden="true" />
                                <div>{renderBulletText(prob)}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-base md:text-[17px] text-text font-normal leading-[1.7]">
                            {renderBulletText(activeProduct.problem)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col h-full">
                      <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-2.5 text-left">
                        SOLUTION PROVIDED
                      </h4>
                      <div className="bg-accent/5 p-4 border border-accent/30 text-base md:text-[17px] text-text font-normal leading-[1.7] flex-1 flex flex-col justify-center text-left">
                        <RichTextRenderer content={activeProduct.solution} />
                      </div>
                    </div>
                  </div>

                  {/* HOW IT WORKS & ARCHITECTURE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col h-full">
                      <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-2.5 text-left">
                        HOW IT WORKS
                      </h4>
                      <div className="subtle-readable-surface p-4 border border-border flex-1 flex flex-wrap items-center gap-2 text-[12px] md:text-[13px]">
                        {activeProduct.flowSteps.map((step, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-text font-normal">
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col h-full">
                      <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-2.5 text-left">
                        ARCHITECTURE
                      </h4>
                      <div className="subtle-readable-surface p-4 border border-border flex-1 flex flex-wrap items-center gap-2 text-[12px] md:text-[13px]">
                        {activeProduct.archComponents.map((comp, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-text font-normal">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* KEY CAPABILITIES & FEATURES */}
                  {activeProduct.capabilities && activeProduct.capabilities.length > 0 && (
                    <div>
                      <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-3 text-left">
                        KEY CAPABILITIES &amp; FEATURES
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeProduct.capabilities.map((cap, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-[12px] md:text-[13px] text-text font-normal"
                          >
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODERN TECHNOLOGY STACK */}
                  {activeProduct.technology && activeProduct.technology.length > 0 && (
                    <div>
                      <h4 className="text-[11px] text-accent font-semibold uppercase tracking-[0.2em] mb-3 text-left">
                        MODERN TECHNOLOGY STACK
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {activeProduct.technology.map((tech, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 bg-bg border border-border text-[12px] md:text-[13px] text-text font-normal"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BUSINESS OUTCOME */}
                  {activeProduct.outcomes && (
                    <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] border-l-2 border-accent">
                      <div className="text-[11px] text-accent uppercase tracking-[0.2em] font-semibold mb-1 text-left">
                        BUSINESS OUTCOME
                      </div>
                      <p className="text-[14px] md:text-[15px] text-text font-normal leading-[1.5] text-left">
                        {activeProduct.outcomes}
                      </p>
                    </div>
                  )}

                  {/* LINKED CASE STUDY */}
                  {activeProduct.caseStudy && (
                    <div className="p-3.5 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                      <div>
                        <span className="text-[11px] text-text-muted font-normal uppercase tracking-wider block mb-0.5 text-left">
                          LINKED CASE STUDY
                        </span>
                        <div className="font-heading font-bold text-text uppercase text-base">
                          {activeProduct.caseStudy}
                        </div>
                      </div>
                      {activeProduct.caseStudySlug ? (
                        <Link
                          to={`/case-studies/${activeProduct.caseStudySlug}`}
                          className="btn btn-secondary text-xs shrink-0 self-start sm:self-center inline-flex items-center gap-1 font-semibold"
                        >
                          View Architecture Blueprint <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to="/case-studies"
                          className="btn btn-secondary text-xs shrink-0 self-start sm:self-center inline-flex items-center gap-1 font-semibold"
                        >
                          View Case Studies <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )}

                  {/* CTA Footer Row */}
                  <div className="pt-4 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link
                      to={`/products/${activeProduct.slug}`}
                      className="btn btn-secondary text-xs inline-flex items-center justify-center gap-1.5"
                    >
                      View Full Specification <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/contact"
                      className="btn btn-primary text-xs inline-flex items-center justify-center gap-1.5"
                    >
                      Discuss This Product <ArrowUpRight className="w-3.5 h-3.5" />
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
            ACCELERATE TRANSFORMATION • 48-HOUR PILOT
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase text-text mb-4">
            WANT TO DEPLOY AN ENGINEERED PRODUCT IN YOUR ENTERPRISE?
          </h2>
          <p className="text-text-muted text-[15px] md:text-[16px] font-normal max-w-xl mx-auto mb-8 leading-[1.6]">
            Our solutions engineering team can conduct a 48-hour pilot setup using BitXhift, MigrateMax, ParseMaster, or LinkGenX.
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
