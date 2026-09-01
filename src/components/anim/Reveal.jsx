import React, { useEffect, useRef, useState } from 'react';

/**
 * Safe Reveal component:
 * Content is ALWAYS 100% visible by default in HTML/CSS.
 * Progressively enhances with smooth GPU-accelerated reveals when IntersectionObserver is supported.
 * Supports variants: 'up' (default) | 'scale' | 'left' | 'flip' | 'mask'
 */
export default function Reveal({
  children,
  className = '',
  index = 0,
  delay = null,
  variant = 'up',
  as: Component = 'div',
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  ...rest
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef(null);

  const computedDelay = delay !== null ? delay : Math.min(index * 70, 350);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) {
      setIsRevealed(true);
      return;
    }

    let observer = null;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry && entry.isIntersecting) {
            setIsRevealed(true);
            if (observer && element) observer.unobserve(element);
          }
        },
        { threshold, rootMargin }
      );
      observer.observe(element);
    } catch {
      setIsRevealed(true);
    }

    // Safety fallback timer: guarantees content is revealed even on slow devices/scroll
    const fallbackTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 650 + computedDelay);

    return () => {
      if (observer) observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [threshold, rootMargin, computedDelay]);

  const variantClass = `reveal-${variant}`;

  return (
    <Component
      ref={ref}
      className={`reveal-item ${variantClass} ${isMounted && !isRevealed ? 'reveal-init' : 'is-revealed'} ${className}`}
      style={{
        '--reveal-delay': `${computedDelay}ms`,
        ...rest.style
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
