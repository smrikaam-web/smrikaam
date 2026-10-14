import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { openBookCallModal } from './BookCallModal';

/**
 * PageCTA Component (Standardized Enterprise Bottom CTA Band)
 * Follows the master reference (Case Studies) design system.
 */
export default function PageCTA({
  eyebrow = "GET IN TOUCH",
  title = "WANT A DETAILED ARCHITECTURE DEEP-DIVE?",
  description = "Book a strategy session to review system schematics, latency benchmarks, and engineering architectures.",
  buttonText = "BOOK STRATEGY CALL",
  buttonLink = "/contact",
  className = ""
}) {
  const isBookCall = buttonLink === '/contact' || buttonText.toUpperCase().includes('BOOK');

  if (isBookCall) {
    return (
      <div className={`mt-16 sm:mt-24 border border-border p-6 sm:p-10 md:p-14 text-center bg-[var(--color-surface)] ${className}`}>
        {eyebrow && (
          <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3">
            {eyebrow}
          </div>
        )}
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-[var(--color-text)] mb-4">
          {title}
        </h2>
        <p className="text-[var(--color-text-muted)] text-[15px] sm:text-[16px] font-normal max-w-xl mx-auto mb-8 leading-[1.6]">
          {description}
        </p>
        <button
          type="button"
          onClick={() => openBookCallModal({ source: title || eyebrow || 'Page CTA Band' })}
          className="btn btn-primary text-xs sm:text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
        >
          <span>{buttonText}</span>
          <ArrowUpRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-16 sm:mt-24 border border-border p-6 sm:p-10 md:p-14 text-center bg-[var(--color-surface)] ${className}`}>
      {eyebrow && (
        <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-[var(--color-text)] mb-4">
        {title}
      </h2>
      <p className="text-[var(--color-text-muted)] text-[15px] sm:text-[16px] font-normal max-w-xl mx-auto mb-8 leading-[1.6]">
        {description}
      </p>
      <Link
        to={buttonLink}
        className="btn btn-primary text-xs sm:text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2"
      >
        <span>{buttonText}</span>
        <ArrowUpRight className="w-4 h-4 ml-1" aria-hidden="true" />
      </Link>
    </div>
  );
}
