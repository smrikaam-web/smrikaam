import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Safe PageTransition component:
 * Seamlessly handles scroll-to-top on route change without blocking overlays.
 * Content is 100% visible immediately.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return <>{children}</>;
}
