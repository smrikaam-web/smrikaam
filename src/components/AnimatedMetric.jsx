import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedMetric Component
 * Animates a numeric metric from 0 to target value when visible in viewport.
 */
export default function AnimatedMetric({
  targetValue,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1800,
  className = '',
  ariaLabel = ''
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          let startTime = null;

          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Smooth cubic ease-out
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = easeOut * targetValue;

            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(targetValue);
            }
          };

          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [targetValue, duration]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue);

  return (
    <div
      ref={elementRef}
      className={className}
      aria-label={ariaLabel || `${prefix}${targetValue}${suffix}`}
    >
      {prefix}{formattedValue}{suffix}
    </div>
  );
}
