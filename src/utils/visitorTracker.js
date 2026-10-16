/**
 * SMRIKAAM Client-Side Anonymous Visitor Tracker
 * - Privacy-first: no third-party ad pixels or intrusive fingerprinting
 * - Requires explicit user consent before running non-essential analytics
 * - Strictly respects Global Privacy Control (GPC), Do Not Track (DNT), and opt-out preferences
 * - Uses navigator.sendBeacon when available for non-blocking telemetry
 */

const STORAGE_KEY_VISITOR = 'smk_visitor_id';
const STORAGE_KEY_SESSION = 'smk_session_id';
const STORAGE_KEY_OPTOUT = 'smk_analytics_optout';
const STORAGE_KEY_CONSENT = 'smk_consent_status'; // 'accepted' | 'rejected'

/**
 * Checks if the visitor has explicitly opted out or signaled privacy intent (GPC / DNT)
 */
export function isOptedOut() {
  if (typeof window === 'undefined') return true;
  if (localStorage.getItem(STORAGE_KEY_OPTOUT) === 'true') return true;
  if (localStorage.getItem(STORAGE_KEY_CONSENT) === 'rejected') return true;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') {
    return true;
  }
  return false;
}

/**
 * Checks if the visitor has explicitly consented to analytics.
 * Strictly enforces that non-essential analytics do NOT run before required consent.
 */
export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  if (isOptedOut()) return false;
  return localStorage.getItem(STORAGE_KEY_CONSENT) === 'accepted';
}

/**
 * Updates consent state and coordinates tracking execution or immediate cleanup
 */
export function setConsentStatus(status) {
  if (typeof window === 'undefined') return;
  const isAccepted = status === 'accepted';
  localStorage.setItem(STORAGE_KEY_CONSENT, isAccepted ? 'accepted' : 'rejected');

  if (isAccepted) {
    localStorage.removeItem(STORAGE_KEY_OPTOUT);
    window.dispatchEvent(new CustomEvent('smk_consent_changed', { detail: { consented: true } }));
    trackPageView(window.location.pathname, document.title);
  } else {
    localStorage.setItem(STORAGE_KEY_OPTOUT, 'true');
    localStorage.removeItem(STORAGE_KEY_VISITOR);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    window.dispatchEvent(new CustomEvent('smk_consent_changed', { detail: { consented: false } }));
  }
}

export function setOptOutPreference(optOut) {
  setConsentStatus(optOut ? 'rejected' : 'accepted');
}

/**
 * Generates or retrieves a random, pseudonymous visitor ID without fingerprinting
 */
export function getVisitorId() {
  if (typeof window === 'undefined') return '';
  if (!hasAnalyticsConsent()) return '';

  let vid = localStorage.getItem(STORAGE_KEY_VISITOR);
  if (!vid) {
    // Generate clean pseudonymous token
    vid = `v_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;
    localStorage.setItem(STORAGE_KEY_VISITOR, vid);
  }
  return vid;
}

/**
 * Generates or retrieves a session ID tied to current browser tab lifetime
 */
export function getSessionId() {
  if (typeof window === 'undefined') return '';
  if (!hasAnalyticsConsent()) return '';

  let sid = sessionStorage.getItem(STORAGE_KEY_SESSION);
  if (!sid) {
    sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    sessionStorage.setItem(STORAGE_KEY_SESSION, sid);
  }
  return sid;
}

let pageEnterTime = Date.now();

export function trackPageView(path, title) {
  // Do not run non-essential analytics before required consent or if opted out
  if (!hasAnalyticsConsent()) return;

  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const currentTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const now = Date.now();
  const dwellSeconds = Math.max(0, Math.round((now - pageEnterTime) / 1000));

  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  if (!visitorId) return;

  const payload = {
    visitorId,
    sessionId,
    path: currentPath,
    title: currentTitle,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    consentStatus: 'Consented',
    duration: dwellSeconds
  };

  pageEnterTime = now;

  // Non-blocking transmission via sendBeacon or fetch
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/visitors/track', blob);
  } else if (typeof fetch !== 'undefined') {
    fetch('/api/visitors/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  }
}

/**
 * Initializes automatic pageview and visibility tracking
 */
export function initVisitorTracker() {
  if (typeof window === 'undefined') return () => {};

  // Track initial page only if consent has already been granted
  if (hasAnalyticsConsent()) {
    trackPageView(window.location.pathname, document.title);
  }

  // Listen for consent changes
  const handleConsentChanged = (e) => {
    if (e.detail?.consented) {
      trackPageView(window.location.pathname, document.title);
    }
  };
  window.addEventListener('smk_consent_changed', handleConsentChanged);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      const dwellSeconds = Math.max(0, Math.round((Date.now() - pageEnterTime) / 1000));
      if (dwellSeconds > 1 && hasAnalyticsConsent()) {
        const payload = {
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
          path: window.location.pathname,
          title: document.title,
          duration: dwellSeconds,
          consentStatus: 'Consented'
        };
        if (navigator.sendBeacon && payload.visitorId) {
          navigator.sendBeacon(
            '/api/visitors/track',
            new Blob([JSON.stringify(payload)], { type: 'application/json' })
          );
        }
      }
    } else {
      pageEnterTime = Date.now();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('smk_consent_changed', handleConsentChanged);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
