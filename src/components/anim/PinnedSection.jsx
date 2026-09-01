import React, { useEffect, useRef, useState } from 'react';

/**
 * PinnedSection component:
 * Implements a sticky pinned container that stays fixed while scrolling through heightMultiplier * 100vh.
 * Driven by native scroll calculations (no scroll-jacking library).
 * Passes active scroll progress (0-1) and step index to children function or renders static children.
 */
export default function PinnedSection({
  children,
  heightMultiplier = 4,
  stepsCount = 4,
  className = ''
}) {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;

      if (totalScrollableHeight <= 0) return;

      // Calculate how far we've scrolled inside this pinned container (0.0 to 1.0)
      const scrolled = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollableHeight));

      setProgress(rawProgress);

      // Determine step index based on progress
      const stepIndex = Math.min(
        stepsCount - 1,
        Math.max(0, Math.floor(rawProgress * stepsCount))
      );
      setCurrentStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [stepsCount]);

  return (
    <section
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${heightMultiplier * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex flex-col justify-between p-6 md:p-12 lg:p-20 overflow-hidden pointer-events-none">
        {typeof children === 'function'
          ? children({ progress, currentStep })
          : children}
      </div>
    </section>
  );
}
