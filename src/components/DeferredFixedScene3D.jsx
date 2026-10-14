import React, { useState, useEffect, Suspense, lazy } from 'react';

// Lazy import Three.js scene only when deferred wrapper triggers
const FixedScene3D = lazy(() => import('./FixedScene3D'));

export default function DeferredFixedScene3D() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    // 1. Immediately return on mobile devices (< 768px viewport)
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) return;

    // 2. Respect accessibility reduced motion preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // 3. Defer 3D loading until after initial page render and main thread idle
    let idleId = null;
    let timerId = null;

    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setCanLoad(true), { timeout: 2500 });
      } else {
        timerId = setTimeout(() => setCanLoad(true), 1200);
      }
    };

    if (document.readyState === 'complete') {
      scheduleLoad();
    } else {
      window.addEventListener('load', scheduleLoad, { once: true });
    }

    return () => {
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('load', scheduleLoad);
    };
  }, []);

  if (!canLoad) return null;

  return (
    <Suspense fallback={null}>
      <FixedScene3D />
    </Suspense>
  );
}
