import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Page-Aware & Section-Aware Vertical Scroll Rail
 * Automatically discovers sections present on the current route,
 * tracks active section via IntersectionObserver, and provides
 * smooth scroll navigation for both Desktop (left rail) and Mobile (compact jumper).
 */
export default function VerticalScrollRail() {
  const location = useLocation();
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const observerRef = useRef(null);
  const drawerRef = useRef(null);
  const sectionsRef = useRef([]);

  // Check if current route is admin panel (skip rail on admin routes)
  const isAdminRoute = location.pathname.startsWith('/smrikaam-admin') || location.pathname.startsWith('/smk-console');

  // Discover sections on the current page
  const discoverSections = useCallback(() => {
    if (typeof document === 'undefined') return;

    // Home Page specific structure
    if (location.pathname === '/') {
      const homeSecs = [
        { id: 'hero', title: 'HERO', scrollLabel: 'SCROLL 0' },
        { id: 'overview', title: 'WHO WE ARE & WHAT WE BUILD', scrollLabel: 'SCROLL 1' },
        { id: 'problems', title: 'BUSINESS PROBLEMS', scrollLabel: 'SCROLL 2' },
      ];
      setSections(homeSecs);
      setActiveSection(homeSecs[0].id);
      return;
    }

    // Discover all candidate section elements on the page
    const candidates = Array.from(
      document.querySelectorAll(
        'section[id], [data-scroll-label], [data-scroll-id], main > div[id], [role="tabpanel"][id]'
      )
    );

    const ignoredIds = new Set([
      'tech-ribbon',
      'scroll-progress-bar',
      'nav',
      'footer',
      'bottom-control-bar',
      'intro-loader',
      'fixed-scene-3d',
    ]);

    const discovered = [];
    const seenIds = new Set();

    candidates.forEach((el) => {
      const id = el.getAttribute('data-scroll-id') || el.id;
      if (!id || ignoredIds.has(id) || seenIds.has(id)) return;

      // Filter out hidden or zero-height elements
      if (el.offsetHeight < 50 || window.getComputedStyle(el).display === 'none') return;

      seenIds.add(id);

      // Extract meaningful section title
      let title = el.getAttribute('data-scroll-label') || el.getAttribute('aria-label');
      if (!title) {
        const heading = el.querySelector('h1, h2, h3, h4');
        if (heading && heading.innerText) {
          title = heading.innerText.trim();
        }
      }
      if (!title) {
        title = id.replace(/[-_]/g, ' ').toUpperCase();
      }

      // Truncate long titles to max 28 characters
      if (title.length > 28) {
        title = title.substring(0, 26).trim() + '…';
      }

      discovered.push({
        id,
        title: title.toUpperCase(),
        scrollLabel: `SCROLL ${discovered.length}`,
      });
    });

    // Fallback: If no explicit sections found, create generic page overview
    if (discovered.length === 0) {
      const mainHeading = document.querySelector('h1')?.innerText?.trim() || 'PAGE OVERVIEW';
      discovered.push({
        id: 'top',
        title: mainHeading.length > 24 ? mainHeading.substring(0, 22) + '…' : mainHeading.toUpperCase(),
        scrollLabel: 'SCROLL 0',
      });
    }

    // Only update state if discovered section IDs/titles actually changed
    const isSame =
      sectionsRef.current.length === discovered.length &&
      sectionsRef.current.every(
        (sec, idx) => sec.id === discovered[idx]?.id && sec.title === discovered[idx]?.title
      );

    if (!isSame) {
      sectionsRef.current = discovered;
      setSections(discovered);
      if (discovered.length > 0) {
        setActiveSection((prev) => (discovered.some((s) => s.id === prev) ? prev : discovered[0].id));
      }
    }
  }, [location.pathname]);

  // Maintain sectionsRef sync
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Re-discover sections on route change and DOM mutations
  useEffect(() => {
    if (isAdminRoute) return;

    discoverSections();

    // Re-check after dynamic content finishes rendering
    const timer = setTimeout(discoverSections, 400);

    let rafId = null;
    // Observe DOM changes (e.g. async CMS data load)
    const mutationObserver = new MutationObserver((mutations) => {
      // Ignore mutations originated from vertical rail elements itself
      const isRailMutation = mutations.every((m) => {
        const target = m.target;
        return target && target.closest && (target.closest('aside') || target.closest('.scroll-progress-bar'));
      });
      if (isRailMutation) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        discoverSections();
      });
    });

    const mainEl = document.querySelector('main') || document.body;
    if (mainEl) {
      mutationObserver.observe(mainEl, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
    };
  }, [location.pathname, isAdminRoute, discoverSections]);

  // Set up IntersectionObserver to track currently visible section
  useEffect(() => {
    if (isAdminRoute || sections.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: [0.1, 0.4],
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    // Fallback scroll listener for smooth top/bottom edge tracking
    const handleScrollFallback = () => {
      const scrollPos = window.scrollY + 160;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScrollFallback, { passive: true });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      window.removeEventListener('scroll', handleScrollFallback);
    };
  }, [sections, isAdminRoute]);

  // Close mobile drawer on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setMobileDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 70;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (isAdminRoute || sections.length === 0) {
    return null;
  }

  const activeSecObj = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP FIXED VERTICAL SCROLL RAIL (>= xl / 1280px) */}
      {/* ============================================================ */}
      <aside
        className="hidden xl:flex flex-col fixed left-0 top-16 bottom-0 w-12 z-40 border-r border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md justify-between py-6 select-none pointer-events-auto transition-colors duration-200"
        aria-label="Page Section Navigation Rail"
      >
        <div className="flex flex-col items-center gap-6 h-full justify-around">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`group flex flex-col items-center transition-all duration-200 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] ${
                  isActive ? 'opacity-100' : 'opacity-45 hover:opacity-100'
                }`}
                title={`${sec.scrollLabel} — ${sec.title}`}
                aria-label={`Scroll to ${sec.title}`}
              >
                <span
                  className={`font-mono text-[9px] uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'text-[var(--color-text)] font-bold'
                      : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {sec.scrollLabel}
                </span>
                <span
                  className={`w-1 transition-all duration-200 mt-1.5 ${
                    isActive
                      ? 'bg-[var(--color-text)] h-5 shadow-sm'
                      : 'bg-[var(--color-border-strong)] h-2.5 group-hover:bg-[var(--color-text-secondary)]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* TABLET ADAPTIVE SCROLL JUMPER (sm to xl) */}
      {/* ============================================================ */}
      <div
        ref={drawerRef}
        className="hidden sm:block xl:hidden fixed bottom-14 left-4 z-40 pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg)]/95 border border-[var(--color-border)] backdrop-blur-md shadow-lg text-[var(--color-text)] text-[10px] font-semibold uppercase tracking-wider transition-all hover:border-[var(--color-accent)] cursor-pointer"
          aria-label="Section Jumper and Current Scroll"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="truncate max-w-[170px] sm:max-w-[240px]">
            {activeSecObj ? (activeSecObj.title ? `${activeSecObj.scrollLabel} — ${activeSecObj.title}` : activeSecObj.scrollLabel) : 'NAVIGATION'}
          </span>
          <span className="text-[var(--color-text-muted)] font-normal ml-0.5">
            ({sections.length})
          </span>
        </button>

        {/* Mobile Section Jump Popup Menu */}
        {mobileDrawerOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-72 max-h-64 overflow-y-auto bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest px-2 py-1 border-b border-[var(--color-border)] font-semibold flex items-center justify-between">
              <span>PAGE ARCHITECTURE</span>
              <span>{sections.length} SECTIONS</span>
            </div>
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    scrollToSection(sec.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`text-left px-2.5 py-2 text-[10px] uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-bold border-l-2 border-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="truncate pr-2">{sec.scrollLabel} — {sec.title}</span>
                  {isActive && <span className="text-[var(--color-accent)] font-bold shrink-0">●</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
