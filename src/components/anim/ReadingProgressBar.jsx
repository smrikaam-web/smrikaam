import React, { useEffect, useState } from 'react';

/**
 * ReadingProgressBar component:
 * Fixed 3px tall progress bar at the top of detail pages that fills 0% to 100% based on article scroll position.
 */
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-transparent pointer-events-none">
      <div
        className="h-full bg-accent transition-all duration-75 ease-out shadow-[0_0_8px_rgba(0,98,204,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
