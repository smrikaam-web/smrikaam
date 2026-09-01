import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
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

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/accelerators/${slug}`);
        if (res.data && res.data.status === 'published') {
          setProduct(res.data);
          setError(null);
        } else if (res.data && !res.data.status) {
          setProduct(res.data);
          setError(null);
        } else {
          setProduct(null);
          setError('The requested product is currently unavailable, in draft, or archived.');
        }
      } catch (err) {
        setProduct(null);
        setError('The requested product is currently unavailable, in draft, or archived.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return <div className="font-mono text-sm text-text-muted pt-32 pb-24 text-center">LOADING_SPECIFICATION...</div>;
  }

  if (error || !product) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto text-center">
        <BlueprintWrapper className="service-detail-surface p-12">
          <div className="font-mono text-xs text-accent uppercase mb-4">404 NOT FOUND</div>
          <h1 className="font-heading text-3xl text-text mb-4 uppercase">PRODUCT NOT FOUND</h1>
          <p className="text-text-muted mb-6">{error || 'The requested product specification does not exist.'}</p>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Products Catalog
          </Link>
        </BlueprintWrapper>
      </div>
    );
  }

  const problemPoints = parseBulletPoints(product.problem || product.problemStatement || [
    'Operational Unpredictability: High scrap rates and unpredicted machinery faults causing costly downtime.',
    'Legacy Protocol Fragmentation: Inability to bridge heterogeneous PLC architectures to unified telemetry streams.',
    'Data Latency Overhead: Sluggish cloud-dependent architectures that compromise sub-second edge operations.'
  ]);
  const flowSteps = parseFlowSteps(product.howItWorks || 'Edge Telemetry → Signal Normalization → Stream Processing → Unified Dashboard');
  const archComponents = parseArchitectureComponents(product.architecture || 'OPC-UA Collector + Node-RED Middleware + TimescaleDB Engine + React Mesh');
  const keyCapabilities = Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0
    ? product.keyFeatures
    : (Array.isArray(product.keyCapabilities) ? product.keyCapabilities : [
        'Real-Time OEE Calculation',
        'Vibration Anomaly Detection',
        'Energy Load Optimization',
        'Automated Shift Reporting'
      ]);
  const techList = Array.isArray(product.technology) && product.technology.length > 0
    ? product.technology
    : ['MQTT', 'OPC-UA', 'Node-RED', 'TimescaleDB', 'Docker Edge', 'React', 'Python', 'Grafana'];

  return (
    <div className="relative z-10 pt-28 pb-24 px-6 md:px-16 max-w-5xl mx-auto">
      <ReadingProgressBar />

      <Link to="/products" className="inline-flex items-center gap-2 text-xs text-accent uppercase mb-8 hover:underline font-semibold">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Products Catalog
      </Link>

      <div id="overview" data-scroll-label="OVERVIEW">
        <BlueprintWrapper className="service-detail-surface p-8 md:p-12 mb-12">

          <TextReveal
            text={product.name || product.title}
            as="h1"
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-6 leading-[0.96]"
          />

          <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] font-normal border-l-2 border-[var(--color-accent)] pl-4 mb-8 text-left leading-[1.6]">
            {product.tagline || product.shortDescription}
          </p>

          {/* Real Photograph with Caption */}
          {product.cover_image_url && (
            <Reveal className="mb-10 overflow-hidden border border-border h-80 relative bg-black/5 dark:bg-white/5">
              <img
                src={product.cover_image_url}
                alt={product.name || product.title}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-sm text-[11px] text-white/90 tracking-wider text-left uppercase">
                {(product.name || product.title).toUpperCase()} — Production Engineering Specification
              </div>
            </Reveal>
          )}

          {/* Narrative Content Body */}
          {(product.fullDescription || product.description) && (
            <Reveal className="mb-12">
              <div className="text-[14px] md:text-[15px] font-normal text-text-muted leading-[1.6] text-left">
                <RichTextRenderer content={product.fullDescription || product.description} />
              </div>
            </Reveal>
          )}

          {/* PROBLEM SOLVED & SOLUTION PROVIDED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-8 mb-12">
            <div className="flex flex-col h-full">
              <h3 className="text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3 text-left">
                PROBLEM SOLVED
              </h3>
              <div className="subtle-readable-surface p-4 border border-border flex-1 flex flex-col justify-center">
                {problemPoints.length > 1 ? (
                  <ul className="space-y-2">
                    {problemPoints.map((prob, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-base md:text-[17px] font-normal text-text leading-[1.7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" aria-hidden="true" />
                        <div>{renderBulletText(prob)}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-base md:text-[17px] text-text font-normal leading-[1.7] text-left">
                    {renderBulletText(product.problem)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col h-full">
              <h3 className="text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3 text-left">
                SOLUTION PROVIDED
              </h3>
              <div className="bg-accent/5 p-4 border border-accent/30 text-base md:text-[17px] text-text font-normal leading-[1.7] flex-1 flex flex-col justify-center text-left">
                <RichTextRenderer content={product.solution || 'Standardized edge intelligence engine delivering sub-second anomaly detection, local protocol normalization, and autonomous offline operations.'} />
              </div>
            </div>
          </div>

          {/* HOW IT WORKS & ARCHITECTURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-8 mb-12">
            <div className="flex flex-col h-full">
              <h3 className="text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3 text-left">
                HOW IT WORKS
              </h3>
              <div className="subtle-readable-surface p-4 border border-border flex-1 flex flex-wrap items-center gap-2 text-[12px] md:text-[13px]">
                {flowSteps.map((step, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-text font-normal">
                    {step}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col h-full">
              <h3 className="text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3 text-left">
                ARCHITECTURE
              </h3>
              <div className="subtle-readable-surface p-4 border border-border flex-1 flex flex-wrap items-center gap-2 text-[12px] md:text-[13px]">
                {archComponents.map((comp, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-text font-normal">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* KEY CAPABILITIES & FEATURES */}
          {keyCapabilities.length > 0 && (
            <div id="capabilities" data-scroll-label="CAPABILITIES">
              <Reveal className="border-t border-border pt-8 mb-12">
                <h3 className="text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-4 text-left">
                  KEY CAPABILITIES &amp; FEATURES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {keyCapabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-border text-[12px] md:text-[13px] text-text font-normal">
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
                <h3 className="text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-4 text-left">
                  MODERN TECHNOLOGY STACK
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {techList.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 bg-bg border border-border text-[12px] md:text-[13px] text-text font-normal"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          )}

          {/* BUSINESS OUTCOME */}
          {product.businessOutcomes && (
            <div id="outcome" data-scroll-label="OUTCOME" className="border-t border-border pt-8 mb-12">
              <div className="p-4 bg-black/[0.02] dark:bg-white/[0.03] border-l-2 border-accent">
                <div className="text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-1 text-left">
                  BUSINESS OUTCOME
                </div>
                <p className="text-[14px] md:text-[15px] text-text font-normal leading-[1.5] text-left">
                  {product.businessOutcomes}
                </p>
              </div>
            </div>
          )}

          {/* LINKED CASE STUDY */}
          {product.caseStudy && (
            <div id="casestudy" data-scroll-label="CASE STUDY" className="border-t border-border pt-8 mb-12">
              <div className="p-3.5 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                <div>
                  <span className="text-[11px] text-text-muted font-normal uppercase tracking-wider block mb-0.5 text-left">
                    LINKED CASE STUDY
                  </span>
                  <span className="font-heading font-bold text-text uppercase text-base text-left block">{product.caseStudy}</span>
                </div>
                <Link to="/case-studies" className="text-accent hover:underline inline-flex items-center gap-1.5 font-bold shrink-0">
                  <span>View Blueprint</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div id="cta" data-scroll-label="STRATEGY CALL" className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-heading text-lg font-bold text-text uppercase text-left">Deploy This Product</div>
              <div className="text-xs text-text-muted text-left">Initiate a 48-hour enterprise pilot or proof-of-concept setup</div>
            </div>
            <Link to="/contact" className="btn btn-primary">
              Discuss This Product <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </BlueprintWrapper>
      </div>
    </div>
  );
}
