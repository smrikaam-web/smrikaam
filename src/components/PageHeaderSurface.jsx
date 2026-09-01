import React from 'react';
import TextReveal from './anim/TextReveal';
import BannerDrawBorder from './anim/BannerDrawBorder';

/**
 * PageHeaderSurface Component (Reference B: Accelerators Architectural Title Style)
 * 
 * Provides a unified architectural title header across all public and CMS pages:
 * - Technical Eyebrow
 * - Accent details & dynamic badge
 * - Architectural border + subtle glass background with backdrop blur
 * - High-contrast uppercase title with reveal animation
 * - Supporting description with accent border-left
 */
export default function PageHeaderSurface({
  eyebrow,
  badge,
  title,
  description,
  children,
  className = ''
}) {
  return (
    <div className={`page-title-surface relative border border-border p-8 md:p-12 mb-16 overflow-hidden ${className}`}>
      <BannerDrawBorder />
      
      {(eyebrow || badge) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {eyebrow && (
            <div className="text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold">
              {eyebrow}
            </div>
          )}
          {badge && (
            <div className="text-[10px] md:text-[11px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1 bg-black/[0.02] dark:bg-white/[0.03] font-normal">
              {badge}
            </div>
          )}
        </div>
      )}

      {title && (
        <TextReveal
          text={title}
          as="h1"
          className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-4 leading-[0.96]"
        />
      )}

      {description && (
        <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-3xl border-l-2 border-[var(--color-accent)] pl-4 font-normal leading-[1.6]">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
