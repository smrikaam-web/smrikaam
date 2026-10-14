import React, { useState, useEffect } from 'react';

/**
 * Official SMRIKAAM Technologies Logo Component
 *
 * Renders the single real brand lockup (blue geometric icon + SMRIKAAM
 * wordmark) from the uploaded PNG asset:
 *   - smrikaam-logo-dark.png  (white wordmark — for dark surfaces)
 *   - smrikaam-logo-light.png (dark wordmark — for light surfaces)
 *
 * The same lockup is used on BOTH desktop and mobile so the complete
 * SMRIKAAM company name is always visible in the header.
 *
 * No filter:invert, no recoloring, no recreation. Original assets only.
 */
export default function Logo({
  className = '',
  height = 44,
  isLightBackground,
  dark,
  forceDark
}) {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // If dark/forceDark is explicitly true or isLightBackground is explicitly false, use dark surface logo
  const useLight = (dark || forceDark || isLightBackground === false)
    ? false
    : (isLightBackground === true ? true : !isDark);

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
      {useLight ? (
        <img
          src="/assets/smrikaam-logo-light.png"
          alt="SMRIKAAM Technologies — Progress Through Innovation"
          width={Math.round(height * (745 / 170))}
          height={height}
          fetchPriority="high"
          decoding="async"
          style={{ height: `${height}px`, width: 'auto' }}
          className="smrikaam-brand-logo object-contain object-left transition-transform duration-200 ease-out hover:scale-[1.02] shrink-0"
        />
      ) : (
        <img
          src="/assets/smrikaam-logo-dark.png"
          alt="SMRIKAAM Technologies — Progress Through Innovation"
          width={Math.round(height * (745 / 170))}
          height={height}
          fetchPriority="high"
          decoding="async"
          style={{ height: `${height}px`, width: 'auto' }}
          className="smrikaam-brand-logo object-contain object-left transition-transform duration-200 ease-out hover:scale-[1.02] shrink-0"
        />
      )}
    </div>
  );
}
