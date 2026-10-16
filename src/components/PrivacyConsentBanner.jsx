import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Settings, Lock } from 'lucide-react';
import { setConsentStatus, hasAnalyticsConsent, isOptedOut } from '../utils/visitorTracker';

export default function PrivacyConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Only show banner if user hasn't made an explicit choice yet
    const consentDecision = localStorage.getItem('smk_consent_status');
    if (!consentDecision && !isOptedOut()) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setAnalyticsEnabled(consentDecision === 'accepted');
    }

    // Support reopening preference modal from footer or settings
    const handleOpenModal = () => {
      setAnalyticsEnabled(hasAnalyticsConsent());
      setModalOpen(true);
    };
    window.addEventListener('smk_open_cookie_settings', handleOpenModal);
    return () => window.removeEventListener('smk_open_cookie_settings', handleOpenModal);
  }, []);

  const handleAcceptAll = () => {
    setConsentStatus('accepted');
    setAnalyticsEnabled(true);
    setVisible(false);
    setModalOpen(false);
  };

  const handleRejectAll = () => {
    setConsentStatus('rejected');
    setAnalyticsEnabled(false);
    setVisible(false);
    setModalOpen(false);
  };

  const handleSaveCustom = () => {
    setConsentStatus(analyticsEnabled ? 'accepted' : 'rejected');
    setVisible(false);
    setModalOpen(false);
  };

  return (
    <>
      {/* Bottom Sticky Consent Banner */}
      {visible && (
        <div
          role="region"
          aria-label="Privacy and Telemetry Consent"
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-black/95 border-t border-neutral-800 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom font-mono text-xs"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none border border-neutral-700 bg-neutral-900 flex items-center justify-center shrink-0 text-white mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold tracking-widest text-[11px] uppercase">
                    PRIVACY &amp; TELEMETRY NOTICE
                  </span>
                  <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-300 text-[10px] uppercase border border-neutral-700">
                    ZERO AD-PIXELS
                  </span>
                </div>
                <p className="text-neutral-400 font-sans text-xs sm:text-[13px] leading-relaxed max-w-3xl">
                  SMRIKAAM uses anonymous session telemetry to evaluate architecture demand and voluntary inquiries. We never deploy third-party advertising pixels, buy external profiles, or sell your data. Non-essential analytics run only with your consent.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" /> PREFERENCES
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-700 bg-transparent hover:bg-neutral-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                REJECT NON-ESSENTIAL
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-1.5 text-xs text-black font-bold bg-white hover:bg-neutral-200 transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> ACCEPT ALL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Granular Cookie & Privacy Preferences Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0c0c0e] border border-neutral-800 p-6 space-y-5 text-xs font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase">
                <Shield className="w-4 h-4 text-white" />
                COOKIE &amp; PRIVACY PREFERENCES
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-neutral-400 font-sans leading-relaxed text-xs">
              Manage how SMRIKAAM stores data on your device. We respect browser privacy signals (Global Privacy Control and Do Not Track) by default.
            </p>

            <div className="space-y-3">
              {/* Category 1: Strictly Necessary */}
              <div className="bg-black/60 border border-neutral-800 p-3.5 flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-bold uppercase text-[11px] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    ESSENTIAL STORAGE (REQUIRED)
                  </div>
                  <p className="text-neutral-400 font-sans text-[11px] mt-1 leading-normal">
                    Required for core security, session state, and dark/light display preferences. Cannot be disabled.
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 shrink-0 mt-0.5">
                  ALWAYS ACTIVE
                </span>
              </div>

              {/* Category 2: Anonymous Analytics & Telemetry */}
              <div className="bg-black/60 border border-neutral-800 p-3.5 flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-bold uppercase text-[11px]">
                    ANONYMOUS TELEMETRY &amp; JOURNEY RADAR (OPT-IN)
                  </div>
                  <p className="text-neutral-400 font-sans text-[11px] mt-1 leading-normal">
                    Collects pseudonymous pageviews and high-level network PTR domains. No advertising trackers, cross-site profiling, or data brokering.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white" />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-3 py-1.5 text-neutral-400 hover:text-white border border-neutral-800 bg-transparent hover:bg-neutral-900 text-xs uppercase tracking-wider cursor-pointer"
              >
                REJECT ALL
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-1.5 text-white font-bold border border-white/40 bg-neutral-900 hover:bg-neutral-800 text-xs uppercase tracking-wider cursor-pointer"
                >
                  SAVE CHOICES
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-1.5 text-black font-bold bg-white hover:bg-neutral-200 text-xs uppercase tracking-wider cursor-pointer"
                >
                  ACCEPT ALL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
