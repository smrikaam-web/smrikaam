import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Cloud,
  Database,
  Network,
  Brain,
  BarChart2,
  Lock,
} from 'lucide-react';

import HeroCubeCluster from '../components/visuals/HeroCubeCluster';
import WhoWeAreCubeCluster from '../components/visuals/WhoWeAreCubeCluster';
import Smrikaam3DCoreSection from '../components/visuals/Smrikaam3DCoreSection';
import TechStackRibbon from '../components/TechStackRibbon';
import AnimatedMetric from '../components/AnimatedMetric';
import { useCMS } from '../context/CMSContext';

export default function Home() {
  const { services: rawServices, caseStudies: rawCaseStudies } = useCMS() || {};

  const cmsServices = React.useMemo(() => {
    if (!Array.isArray(rawServices)) return [];
    return rawServices.map((s, idx) => ({
      num: String(idx + 1).padStart(2, '0'),
      title: s.title || s.name,
      desc: s.tagline || s.description || s.summary || '',
      path: s.slug ? `/services/${s.slug}` : '/services',
    }));
  }, [rawServices]);

  const cmsCaseStudies = React.useMemo(() => {
    if (!Array.isArray(rawCaseStudies)) return [];
    return rawCaseStudies.map((c) => {
      const technologies = Array.isArray(c.technologies)
        ? c.technologies
        : typeof c.technologies === 'string'
        ? c.technologies.split(',').map((t) => t.trim())
        : ['Enterprise', 'Cloud', 'Data'];

      return {
        title: c.title,
        industry: (c.industry || c.category || 'ENTERPRISE').toUpperCase(),
        problem: c.challenge || c.problemStatement || c.summary || 'Operational system bottleneck.',
        solution: c.solution || c.solutionStatement || 'Engineered automated transformation.',
        tech: technologies.slice(0, 4),
        path: c.slug ? `/case-studies/${c.slug}` : '/case-studies',
        image: c.cover_image_url || null,
      };
    });
  }, [rawCaseStudies]);

  const problems = [
    {
      title: 'LEGACY SYSTEMS',
      point1: 'Modernization & Cloud Migration',
      point2: 'Scalable & Resilient Architecture',
    },
    {
      title: 'DISCONNECTED MACHINES',
      point1: 'Edge IIoT & Telemetry Pipelines',
      point2: 'Real-Time Operational Intelligence',
    },
    {
      title: 'FRAGMENTED DATA',
      point1: 'Unified Data Engineering',
      point2: 'Trusted Single Source of Truth',
    },
    {
      title: 'MANUAL PROCESSES',
      point1: 'Generative AI & Agentic Automation',
      point2: 'Higher Productivity & Lower Errors',
    },
  ];

  // Active Relay Lists directly from CMS
  const activeServices = cmsServices;
  const activeCaseStudies = cmsCaseStudies;

  // Duplicated arrays for seamless infinite looping
  const marqueeServices = [...activeServices, ...activeServices];
  const marqueeCaseStudies = [...activeCaseStudies, ...activeCaseStudies];

  return (
    <div className="relative z-10 w-full overflow-x-hidden bg-transparent text-[var(--color-text)] transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* SCROLL 0 — HERO */}
      {/* ============================================================ */}
      <section
        id="hero"
        data-scroll-label="HERO"
        className="relative flex flex-col justify-center px-6 md:px-12 lg:px-16 py-8 md:py-12 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-[2px] overflow-hidden"
      >
        {/* Subtle architectural background perspective grid */}
        <div className="smk-perspective-grid opacity-25" aria-hidden="true" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            {/* Technical Eyebrow */}
            <div className="inline-flex items-center gap-2 font-mono text-[10px] md:text-[11px] text-[var(--color-text-secondary)] uppercase tracking-[0.16em] border border-[var(--color-border)] px-2.5 py-1 home-card-surface self-start">
              <span className="w-1.5 h-1.5 bg-[var(--color-accent)] animate-pulse" />
              <span>AI • DATA • CLOUD • IIoT • INTELLIGENT AUTOMATION</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-[0.96]">
              ENGINEERING
              <br />
              INTELLIGENCE
              <br />
              FOR THE ENTERPRISE.
            </h1>

            {/* Description */}
            <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-xl leading-[1.6] font-normal">
              We build intelligent, secure, and scalable technology solutions
              that help enterprises modernize, automate and grow.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
              <Link
                to="/contact"
                className="px-5 py-2.5 bg-[var(--button-bg)] text-[var(--button-text)] border border-[var(--button-border)] font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
              >
                <span>BOOK STRATEGY CALL</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
              <Link
                to="/services"
                className="px-5 py-2.5 border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-surface-subtle)] transition-all text-center w-full sm:w-auto"
              >
                EXPLORE CAPABILITIES
              </Link>
            </div>

            {/* System Proof Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-3.5 sm:p-4 mt-2 home-card-surface border border-[var(--color-border)] w-full max-w-lg">
              <div>
                <AnimatedMetric
                  targetValue={50}
                  suffix="+"
                  decimals={0}
                  duration={1800}
                  className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight"
                  ariaLabel="50+ Deployments"
                />
                <div className="text-[10px] sm:text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 font-normal">
                  Deployments
                </div>
              </div>
              <div className="border-l border-[var(--color-border)] pl-3">
                <AnimatedMetric
                  targetValue={17}
                  suffix="M+"
                  decimals={0}
                  duration={1800}
                  className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight"
                  ariaLabel="17M+ Data Points Processed"
                />
                <div className="text-[10px] sm:text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 font-normal">
                  Data Points Processed
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-2.5 sm:pt-0 pl-0 sm:pl-3">
                <AnimatedMetric
                  targetValue={99.999}
                  suffix="%"
                  decimals={3}
                  duration={1800}
                  className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight"
                  ariaLabel="99.999% System Uptime"
                />
                <div className="text-[10px] sm:text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5 font-normal">
                  System Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Right 3D Visual Column */}
          <div className="lg:col-span-5 flex items-center justify-center relative w-full overflow-hidden py-4 lg:py-0">
            <HeroCubeCluster className="w-full max-w-[280px] sm:max-w-[380px] aspect-square mx-auto" />
          </div>
        </div>
      </section>

      {/* Live Running Technology Stack Ribbon */}
      <section
        id="tech-ribbon"
        aria-label="Enterprise Technologies"
        className="relative py-4 bg-[var(--color-bg)]/85 backdrop-blur-sm border-b border-[var(--color-border)]"
      >
        <TechStackRibbon />
      </section>

      {/* ============================================================ */}
      {/* SCROLL 1 — CONNECTED 3D CORE ARCHITECTURAL SYSTEM */}
      {/* ============================================================ */}
      <section
        id="overview"
        data-scroll-label="WHO WE ARE & WHAT WE BUILD"
        aria-label="Who We Are and What We Build"
      >
        <Smrikaam3DCoreSection />
      </section>

      {/* ============================================================ */}
      {/* SCROLL 2 — CONNECTED HOMEPAGE FLOW */}
      {/* ============================================================ */}
      <section
        id="problems"
        data-scroll-label="SERVICES & BUSINESS PROBLEMS"
        aria-label="Services and Business Problems We Solve"
        className="relative py-10 md:py-14 px-6 md:px-12 lg:px-16 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-sm overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10 space-y-6">
          
          {/* ======================================================== */}
          {/* 1. HEADER: BUSINESS PROBLEMS WE SOLVE */}
          {/* ======================================================== */}
          <div className="pb-3 border-b border-[var(--color-border)]">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-[var(--color-text)] tracking-tight flex items-center gap-3">
              <span className="w-2 h-2 bg-[var(--color-accent)] shrink-0" />
              <span>BUSINESS PROBLEMS WE SOLVE</span>
            </h2>
          </div>

          {/* ======================================================== */}
          {/* 2. SERVICES (LTR RELAY) */}
          {/* ======================================================== */}
          <div className="border border-[var(--color-border)] home-card-surface p-4 md:p-5 overflow-hidden">
            <div className="flex items-center mb-3 px-1">
              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase text-[var(--color-accent)] tracking-tight flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[var(--color-accent)] shrink-0" />
                <span>SERVICES</span>
              </h3>
            </div>

            {/* Viewport with Continuous LTR Movement */}
            <div className="scroll2-layer-container py-1">
              <div className="scroll2-layer-track-ltr gap-3">
                {marqueeServices.map((srv, idx) => (
                  <Link
                    key={`srv-${idx}`}
                    to={srv.path}
                    className="px-4 py-2.5 border border-[var(--color-border)] bg-[var(--color-bg)]/90 hover:border-[var(--color-accent)] transition-all shrink-0 flex items-center gap-3.5 group select-none cursor-pointer w-[260px] sm:w-[300px]"
                  >
                    <span className="font-mono text-[11px] text-[var(--color-accent)] font-bold shrink-0">
                      {srv.num}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                        {srv.title}
                      </span>
                      {srv.desc && (
                        <span className="font-mono text-[10px] text-[var(--color-text-muted)] truncate font-normal mt-0.5">
                          {srv.desc}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-[var(--color-accent)] group-hover:translate-x-1 transition-transform shrink-0">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. BUSINESS PROBLEMS CARDS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {problems.map((prob) => (
              <div
                key={prob.title}
                className="p-4 border border-[var(--color-border)] home-card-surface hover:border-[var(--color-border-strong)] transition-all duration-300 flex flex-col justify-between"
              >
                <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-tight text-[var(--color-text)] mb-3">
                  {prob.title}
                </h3>
                <div className="space-y-2 border-t border-[var(--color-border)] pt-3 text-xs sm:text-[13px] font-mono">
                  <div className="text-[var(--color-text-secondary)] font-normal leading-relaxed">
                    {prob.point1}
                  </div>
                  <div className="text-[var(--color-text-secondary)] font-normal leading-relaxed">
                    {prob.point2}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ======================================================== */}
          {/* 4. CASE STUDIES (RTL RELAY) */}
          {/* ======================================================== */}
          <div className="border border-[var(--color-border)] home-card-surface p-4 md:p-5 overflow-hidden">
            <div className="flex items-center mb-3 px-1">
              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold uppercase text-[var(--color-accent)] tracking-tight flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[var(--color-accent)] shrink-0" />
                <span>CASE STUDIES</span>
              </h3>
            </div>

            {/* Viewport with Continuous RTL Movement */}
            <div className="scroll2-layer-container py-1">
              <div className="scroll2-layer-track-rtl gap-4">
                {marqueeCaseStudies.map((cs, idx) => (
                  <Link
                    key={`cs-${idx}`}
                    to={cs.path}
                    className="p-3.5 border border-[var(--color-border)] bg-[var(--color-bg)]/90 hover:border-[var(--color-accent)] transition-all shrink-0 flex gap-3.5 group select-none cursor-pointer w-[300px] sm:w-[380px]"
                  >
                    {/* Image / Thumbnail */}
                    <div className="w-16 sm:w-20 aspect-square border border-[var(--color-border)] overflow-hidden shrink-0 bg-black/5 dark:bg-white/5 relative">
                      {cs.image ? (
                        <img
                          src={cs.image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-[var(--color-text-muted)]">
                          SMK CS
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <div>
                        <div className="font-mono text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-wider mb-1 truncate">
                          {cs.industry}
                        </div>
                        <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate mb-1">
                          {cs.title}
                        </h3>
                        <div className="text-[11px] font-mono text-[var(--color-text-secondary)] line-clamp-1 font-normal">
                          P: {cs.problem}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--color-text-secondary)] line-clamp-1 mt-0.5 font-normal">
                          S: {cs.solution}
                        </div>
                      </div>

                      {/* Tech Tags & Read CTA */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-1 overflow-hidden">
                          {cs.tech && cs.tech.slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[8px] font-mono text-[var(--color-text-secondary)] uppercase truncate"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-[var(--color-accent)] font-bold uppercase flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                          <span>READ</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. BOOK STRATEGY CALL (END CTA BAND) */}
          {/* ======================================================== */}
          <div className="border border-[var(--color-border)] p-6 md:p-8 home-card-surface flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-mono text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-widest">
                ENTERPRISE TRANSFORMATION • STRATEGY CONSULTATION
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold uppercase text-[var(--color-text)]">
                Ready to engineer your next intelligent system?
              </h3>
              <p className="text-[14px] sm:text-[15px] md:text-[17px] text-[var(--color-text-secondary)] font-normal max-w-xl leading-[1.6]">
                Connect with our technical leads in Coimbatore to review architecture blueprints and project roadmaps.
              </p>
            </div>
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[var(--button-bg)] text-[var(--button-text)] border border-[var(--button-border)] font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm w-full sm:w-auto"
            >
              <span>BOOK STRATEGY CALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
