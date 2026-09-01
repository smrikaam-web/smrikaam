import React, { useEffect, useRef, useState } from 'react';

/**
 * TextReveal component:
 * Splits text into words/characters, wrapping each in a container with overflow:hidden.
 * Animates from translateY(110%) + opacity:0 to translateY(0) + opacity:1 with staggered delay.
 * GPU-accelerated (transforms only), respects prefers-reduced-motion.
 */
export default function TextReveal({
  text,
  children,
  as: Component = 'h1',
  delay = 0,
  trigger = 'mount',
  className = '',
  splitBy = 'words' // 'words' | 'chars'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  const rawText = text || (typeof children === 'string' ? children : '');

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (trigger === 'mount') {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      // 'inview' trigger
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
            if (containerRef.current) observer.unobserve(containerRef.current);
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      // Safety fallback timer to prevent permanently hidden elements
      const fallbackTimer = setTimeout(() => setIsVisible(true), delay + 1200);

      return () => {
        observer.disconnect();
        clearTimeout(fallbackTimer);
      };
    }
  }, [trigger, delay]);

  // If text is complex children (JSX elements), render with fade-up wrapper
  if (!rawText && children) {
    return (
      <Component
        ref={containerRef}
        className={`text-reveal-wrapper ${isVisible ? 'is-visible' : ''} ${className}`}
      >
        <span
          className="inline-block transition-all duration-700 ease-out"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
            opacity: isVisible ? 1 : 0
          }}
        >
          {children}
        </span>
      </Component>
    );
  }

  // Process text into words or characters
  const items = splitBy === 'chars'
    ? Array.from(rawText)
    : rawText.split(' ');

  return (
    <Component
      ref={containerRef}
      className={`text-reveal-wrapper ${className}`}
    >
      {items.map((item, index) => {
        const itemDelay = delay + index * (splitBy === 'chars' ? 30 : 60);
        return (
          <React.Fragment key={index}>
            <span className="inline-block overflow-hidden align-top">
              <span
                className="inline-block transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform-gpu"
                style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: `${itemDelay}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {item}
              </span>
            </span>
            {index < items.length - 1 && ' '}
          </React.Fragment>
        );
      })}
    </Component>
  );
}
