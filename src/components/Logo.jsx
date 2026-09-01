import React, { useState, useEffect } from 'react';

/**
 * Official SMRIKAAM Technologies Logo Component
 *
 * Desktop (>=1024px): Full wordmark (smrikaam-logo-dark/light.png)
 * Mobile  (<1024px):  Uploaded official icon (smrikaam-logo-icon.png)
 *
 * The uploaded icon is the exact file provided by the user:
 *   C:\Users\mukhe\Downloads\ChatGPT Image Aug 18, 2026, 01_20_46 PM (1).png
 * Copied to: public/assets/smrikaam-logo-icon.png
 *
 * No filter:invert, no recoloring, no recreation. Original asset only.
 */
export default function Logo({
  className = '',
  height = 44,
  isLightBackground
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

  const useLight = isLightBackground !== undefined ? isLightBackground : !isDark;

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
      {/* Mobile: Uploaded official SMRIKAAM geometric icon */}
      <img
        src="/assets/smrikaam-logo-icon.png"
        alt="SMRIKAAM Technologies"
        className="smrikaam-mobile-logo block lg:hidden shrink-0"
      />
      {/* Desktop: Full wordmark — theme-adaptive */}
      {useLight ? (
        <img
          src="/assets/smrikaam-logo-light.png"
          alt="SMRIKAAM Technologies — Progress Through Innovation"
          style={{ height: `${height}px` }}
          className="hidden lg:block w-auto object-contain object-left transition-transform duration-200 ease-out hover:scale-[1.02] shrink-0"
        />
      ) : (
        <img
          src="/assets/smrikaam-logo-dark.png"
          alt="SMRIKAAM Technologies — Progress Through Innovation"
          style={{ height: `${height}px` }}
          className="hidden lg:block w-auto object-contain object-left transition-transform duration-200 ease-out hover:scale-[1.02] shrink-0"
        />
      )}
    </div>
  );
}



