import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import api from '../api';
import BlueprintWrapper from '../components/BlueprintWrapper';
import ReadingProgressBar from '../components/anim/ReadingProgressBar';
import TextReveal from '../components/anim/TextReveal';
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

export default function IndustryDetail() {
  const { slug } = useParams();
  const [industry, setIndustry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const acceleratorMap = {
    manufacturing: { name: 'BitXhift IIoT Platform', slug: 'bitxhift' },
    energy: { name: 'BitXhift Telemetry Pipeline', slug: 'bitxhift' },
    'energy-utilities': { name: 'BitXhift Telemetry Pipeline', slug: 'bitxhift' },
    retail: { name: 'LinkGenX Integration Mesh', slug: 'linkgenx' },
    'retail-ecommerce': { name: 'LinkGenX Integration Mesh', slug: 'linkgenx' },
    bfsi: { name: 'LinkGenX Integration Mesh', slug: 'linkgenx' },
    healthcare: { name: 'ParseMaster Streaming Engine', slug: 'parsemaster' },
    'healthcare-life-sciences': { name: 'ParseMaster Streaming Engine', slug: 'parsemaster' },
    logistics: { name: 'ParseMaster Ingestion Engine', slug: 'parsemaster' },
    'logistics-supply-chain': { name: 'ParseMaster Ingestion Engine', slug: 'parsemaster' },
    telecom: { name: 'ParseMaster Data Engine', slug: 'parsemaster' },
    infrastructure: { name: 'BitXhift IIoT Platform', slug: 'bitxhift' },
    'oil-gas': { name: 'BitXhift IIoT Platform', slug: 'bitxhift' },
    media: { name: 'ParseMaster Data Engine', slug: 'parsemaster' },
    electrical: { name: 'BitXhift IIoT Platform', slug: 'bitxhift' }
  };

  useEffect(() => {
    async function loadIndustry() {
      try {
        const res = await api.get(`/industries/${slug}`);
        if (res.data && (res.data.status === 'published' || !res.data.status)) {
          setIndustry(res.data);
          setError(null);
        } else {
          setIndustry(null);
          setError('The requested industry sector profile is currently unavailable or archived.');
        }
      } catch (err) {
        setIndustry(null);
        setError('The requested industry sector profile is currently unavailable or archived.');
      } finally {
        setLoading(false);
      }
    }
    loadIndustry();
  }, [slug]);

  if (loading) {
    return <div className="font-mono text-sm text-text-muted pt-32 pb-24 text-center">LOADING_SECTOR_PROFILE...</div>;
  }

  if (error || !industry) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto text-center">
        <BlueprintWrapper className="service-detail-surface p-12">
          <div className="font-mono text-xs text-accent uppercase mb-4">404 NOT FOUND</div>
          <h1 className="font-heading text-3xl text-text mb-4 uppercase">SECTOR NOT FOUND</h1>
          <p className="text-text-muted mb-6">{error || 'The requested industry sector specification does not exist.'}</p>
          <Link to="/industries" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Industries Catalog
          </Link>
        </BlueprintWrapper>
      </div>
    );
  }

  const slugLower = (industry.slug || '').toLowerCase();
  const relatedAcc = industry.acceleratorName && industry.acceleratorSlug
    ? { name: industry.acceleratorName, slug: industry.acceleratorSlug }
    : (acceleratorMap[slugLower] || { name: 'BitXhift & LinkGenX', slug: 'bitxhift' });

  const businessProblemsRaw = industry.businessProblems || industry.challenge || industry.problemStatement;
  const solutionsRaw = industry.solutions || industry.solution || industry.key_solutions;
  const outcomesRaw = industry.outcomes || industry.outcome || industry.businessOutcomes;

  const businessProblems = businessProblemsRaw ? parseBulletPoints(businessProblemsRaw) : [];
  const solutions = solutionsRaw ? parseBulletPoints(solutionsRaw) : [];
  const capabilities = Array.isArray(industry.capabilities) && industry.capabilities.length > 0
    ? industry.capabilities
    : (Array.isArray(industry.useCases) ? industry.useCases : (Array.isArray(industry.key_solutions) ? industry.key_solutions : []));
  const techList = Array.isArray(industry.technology) && industry.technology.length > 0
    ? industry.technology
    : (Array.isArray(industry.techStack) ? industry.techStack : []);
  const outcomes = outcomesRaw ? parseBulletPoints(outcomesRaw) : [];

  return (
    <div className="relative z-10 pt-28 pb-24 px-6 md:px-16 max-w-5xl mx-auto">
      <ReadingProgressBar />

      <Link to="/industries" className="inline-flex items-center gap-2 text-xs text-accent uppercase mb-8 hover:underline font-semibold">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Industries Catalog
      </Link>

      <div id="overview" data-scroll-label="OVERVIEW">
        <BlueprintWrapper className="service-detail-surface p-8 md:p-12 mb-12">

          <TextReveal
            text={industry.name || industry.title}
            as="h1"
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-6 leading-[0.96]"
          />

          <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] font-normal border-l-2 border-[var(--color-accent)] pl-4 mb-8 text-left leading-[1.6]">
            {industry.summary || industry.tagline}
          </p>

          {/* Real Photograph with Caption */}
          {(industry.cover_image_url || industry.image) && (
            <Reveal className="mb-10 overflow-hidden border border-border h-80 relative bg-black/5 dark:bg-white/5">
              <img
                src={industry.cover_image_url || industry.image}
                alt={industry.name || industry.title}
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-sm text-[11px] font-mono text-white/90 tracking-wider text-left uppercase">
                {(industry.name || industry.title).toUpperCase()} — Enterprise Domain Architecture
              </div>
            </Reveal>
          )}

          {/* Detailed Narrative Content */}
          {(industry.content || industry.description) && (
            <Reveal className="mb-12">
              <div className="text-[14px] md:text-[15px] font-normal text-text-muted leading-[1.6] text-left">
                <RichTextRenderer content={industry.content || industry.description} />
              </div>
            </Reveal>
          )}

          {/* BUSINESS PROBLEMS SOLVED */}
          {businessProblems.length > 0 && (
            <div id="problems" data-scroll-label="PROBLEMS" className="border-t border-border pt-8 mb-12">
              <h3 className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3 text-left">
                BUSINESS PROBLEMS SOLVED
              </h3>
              <ul className="space-y-2">
                {businessProblems.map((prob, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-base md:text-[17px] font-normal text-text leading-[1.7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" aria-hidden="true" />
                    <div>{renderBulletText(prob)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* HOW SMRIKAAM SOLVES IT */}
          {solutions.length > 0 && (
            <div id="solutions" data-scroll-label="SOLUTIONS" className="border-t border-border pt-8 mb-12">
              <h3 className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3 text-left">
                HOW SMRIKAAM SOLVES IT
              </h3>
              <ul className="space-y-2">
                {solutions.map((sol, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-base md:text-[17px] font-normal text-text leading-[1.7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" aria-hidden="true" />
                    <div>{renderBulletText(sol)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CORE CAPABILITIES & USE CASES */}
          {capabilities.length > 0 && (
            <div id="capabilities" data-scroll-label="CAPABILITIES">
              <Reveal className="border-t border-border pt-8 mb-12">
                <h3 className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-4 text-left">
                  CORE CAPABILITIES &amp; USE CASES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-[12px] md:text-[13px] font-mono text-text font-normal">
                      <span className="text-accent font-medium select-none">+</span>
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          )}

          {/* MODERN TECHNOLOGY STACK */}
          {techList.length > 0 && (
            <div id="technology" data-scroll-label="TECH STACK">
              <Reveal className="border-t border-border pt-8 mb-12">
                <h3 className="font-mono text-[12px] md:text-[13px] text-accent uppercase tracking-[0.12em] font-medium mb-4 text-left">
                  MODERN TECHNOLOGY STACK
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {techList.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 bg-bg border border-border text-[13px] md:text-[14px] font-mono text-text font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          )}

          {/* BUSINESS OUTCOME */}
          <div id="outcome" data-scroll-label="OUTCOME" className="border-t border-border pt-8 mb-12">
            <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] border-l-2 border-accent">
              <div className="font-mono text-[12px] text-accent uppercase tracking-[0.12em] font-medium mb-1 text-left">
                BUSINESS OUTCOME
              </div>
              {Array.isArray(outcomes) ? (
                <ul className="space-y-1.5">
                  {outcomes.map((outc, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] md:text-[15px] font-semibold text-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" aria-hidden="true" />
                      <div>{renderBulletText(outc)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] md:text-[16px] text-text font-semibold leading-[1.5] text-left">
                  {outcomes}
                </p>
              )}
            </div>
          </div>

          {/* 06 // RELATED PRODUCT / ACCELERATOR & CASE STUDY */}
          <div id="accelerator" data-scroll-label="ACCELERATOR" className="border-t border-border pt-8 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[13px]">
              <div className="p-3.5 border border-border/70 flex flex-col justify-between">
                <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1.5 text-left">
                  RELATED PRODUCT / ACCELERATOR
                </span>
                <Link
                  to={`/products/${relatedAcc.slug}`}
                  className="text-text font-medium hover:text-accent transition-colors inline-flex items-center gap-1.5 group/acc"
                >
                  <span>{relatedAcc.name}</span>
                  <span className="text-accent transition-transform duration-200 group-hover/acc:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="p-3.5 border border-border/70 flex flex-col justify-between">
                <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1.5 text-left">
                  LINKED CASE STUDY
                </span>
                <Link
                  to="/case-studies"
                  className="text-text font-medium hover:text-accent transition-colors inline-flex items-center gap-1.5 group/cs"
                >
                  <span>{industry.name} Enterprise Transformation</span>
                  <span className="text-accent transition-transform duration-200 group-hover/cs:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div id="cta" data-scroll-label="STRATEGY CALL" className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-heading text-lg font-bold text-text uppercase text-left">Deploy Domain Blueprint</div>
              <div className="font-mono text-xs text-text-muted text-left">Initiate a 48-hour sector architecture workshop with our engineering team</div>
            </div>
            <Link to="/contact" className="btn btn-primary">
              Schedule Consultation <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </BlueprintWrapper>
      </div>
    </div>
  );
}
