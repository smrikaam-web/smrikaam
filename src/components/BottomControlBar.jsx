import React from 'react';

/**
 * Floating Social Media Dock Component
 * Replaces the former floating status bar with a compact, ultra-premium social media dock.
 * Positioned fixed in the bottom-right corner.
 * Features:
 * - Direct links to LinkedIn, X, Instagram, and Facebook
 * - Translucent surface with backdrop blur
 * - Theme-adaptive monochrome colors (Dark icons on light theme, Light icons on dark theme)
 * - Micro-animations on hover (scale, translate, highlight)
 * - Keyboard accessible with aria-labels and tooltips
 */
export default function BottomControlBar() {
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/143362970/',
      ariaLabel: 'SMRIKAAM on LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
        </svg>
      )
    },
    {
      name: 'X',
      url: 'https://x.com/smrikaam_tech',
      ariaLabel: 'SMRIKAAM on X',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/smrikaam_tech',
      ariaLabel: 'SMRIKAAM on Instagram',
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61593678981066',
      ariaLabel: 'SMRIKAAM on Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.69c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
      )
    }
  ];

  return (
    <aside
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-8 z-40"
      aria-label="Social Media Links"
    >
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/92 dark:bg-[#0f0f0f]/92 backdrop-blur-md border border-black/10 dark:border-white/15 shadow-xl transition-all duration-300">
        {socialLinks.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
            title={item.name}
            className="p-2.5 rounded-full text-text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {item.icon}
          </a>
        ))}
      </div>
    </aside>
  );
}
