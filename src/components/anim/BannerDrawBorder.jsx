import React, { useEffect, useState } from 'react';

/**
 * BannerDrawBorder component:
 * Renders an animated SVG border around hero banners on list pages (Services, Industries, Case Studies, Blog).
 * stroke-dashoffset animates from 100% to 0% on page load.
 */
export default function BannerDrawBorder({ className = '' }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setAnimated(true);
      return;
    }
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg className="w-full h-full stroke-accent/40 fill-none" preserveAspectRatio="none">
        <rect
          x="1"
          y="1"
          width="99.5%"
          height="99.5%"
          strokeWidth="1.5"
          strokeDasharray="400 400"
          strokeDashoffset={animated ? '0' : '400'}
          className="transition-all duration-1200 ease-out"
        />
      </svg>
    </div>
  );
}
