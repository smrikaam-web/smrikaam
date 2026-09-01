import React, { useRef, useEffect } from 'react';

export const ENTERPRISE_TECHNOLOGIES = [
  'AWS',
  'Azure',
  'Google Cloud',
  'Snowflake',
  'Databricks',
  'dbt',
  'Apache Spark',
  'Kubernetes',
  'Docker',
  'Terraform',
  'Grafana',
  'Apache Kafka',
  'ServiceNow',
  'SAP',
  'Python',
  'PyTorch',
  'MLflow',
  'AWS Bedrock'
];

export default function TechStackRibbon({ className = '' }) {
  // Duplicate array 2x for seamless infinite marquee loop
  const marqueeItems = [...ENTERPRISE_TECHNOLOGIES, ...ENTERPRISE_TECHNOLOGIES];

  const containerRef = useRef(null);
  const parallaxRef = useRef(null);
  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const rafIdRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect touch-only / coarse pointer devices
    const isTouchDevice =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      // Smooth lerp interpolation for 60fps spring effect
      currentOffsetRef.current = lerp(currentOffsetRef.current, targetOffsetRef.current, 0.08);

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${currentOffsetRef.current.toFixed(2)}px, 0, 0)`;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;

    // Normalize cursor X to range -1 -> 0 -> +1
    const relativeX = (e.clientX - rect.left) / rect.width;
    const normalizedX = Math.max(-1, Math.min(1, (relativeX - 0.5) * 2));

    // Cap maximum cursor-induced offset to ±50px
    const maxOffset = 50;
    targetOffsetRef.current = normalizedX * maxOffset;
  };

  const handleMouseLeave = () => {
    // Smoothly return cursor offset toward 0 on mouse exit
    targetOffsetRef.current = 0;
  };

  return (
    <div id="tech-ribbon" className={`w-full overflow-hidden ${className}`}>
      {/* Ribbon Header Label */}
      <div className="flex items-center justify-center px-6 md:px-12 lg:px-16 max-w-7xl mx-auto mb-2">
        <div className="text-[12px] sm:text-[13px] md:text-[15px] text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-semibold flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 bg-[var(--color-accent)] animate-pulse" />
          <span>POWERED BY ENTERPRISE-GRADE TECHNOLOGIES</span>
        </div>
      </div>

      {/* Marquee Viewport with Edge Fade Masks */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="tech-ribbon-container py-2.5 overflow-hidden"
        role="region"
        aria-label="Enterprise Technologies Powered by SMRIKAAM"
      >
        <div ref={parallaxRef} className="tech-ribbon-parallax-wrapper">
          <div className="tech-ribbon-track">
            {marqueeItems.map((tech, idx) => (
              <div key={`${tech}-${idx}`} className="tech-ribbon-item">
                <span>{tech}</span>
                <span className="tech-ribbon-sep" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
