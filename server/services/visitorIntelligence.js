import dns from 'dns/promises';
import crypto from 'crypto';

// In-memory LRU-style cache for DNS PTR lookups (Max 500 entries)
const dnsCache = new Map();
const MAX_CACHE_SIZE = 500;

// Rotate salt daily to prevent permanent cross-day correlation of raw IPs
let currentDailySalt = crypto.randomBytes(16).toString('hex');
let lastSaltDate = new Date().getUTCDate();

function getDailySalt() {
  const today = new Date().getUTCDate();
  if (today !== lastSaltDate) {
    currentDailySalt = crypto.randomBytes(16).toString('hex');
    lastSaltDate = today;
  }
  return currentDailySalt;
}

/**
 * Anonymize IP address in compliance with data minimization principles.
 * IPv4: replaces last octet with '0' (e.g. 192.0.2.14 -> 192.0.2.0)
 * IPv6: masks lower 80 bits
 */
export function anonymizeIp(ip) {
  if (!ip || typeof ip !== 'string') return '0.0.0.0';
  const cleanIp = ip.replace(/^::ffff:/, '').trim();

  // IPv4
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  // IPv6
  if (cleanIp.includes(':')) {
    const parts = cleanIp.split(':');
    return `${parts.slice(0, 3).join(':')}::`;
  }

  return '0.0.0.0';
}

/**
 * Creates a pseudonymized daily visitor hash from IP + UserAgent for duplicate hit filtering
 */
export function createDailyVisitorHash(ip, userAgent) {
  const salt = getDailySalt();
  return crypto.createHash('sha256').update(`${ip || ''}_${userAgent || ''}_${salt}`).digest('hex').substring(0, 16);
}

/**
 * Validates visitor and session IDs: alphanumeric plus underscore and hyphen, 8-64 chars
 */
export function isValidVisitorId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_\-]{8,64}$/.test(id);
}

/**
 * Parses high-level device and browser category without intrusive fingerprinting
 */
export function parseUserAgent(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') {
    return {
      deviceCategory: 'Desktop',
      browserCategory: 'Unknown',
      summary: 'Desktop (Unknown)'
    };
  }

  let deviceCategory = 'Desktop';
  if (/iPad|Tablet/i.test(userAgent)) {
    deviceCategory = 'Tablet';
  } else if (/Mobile|Android|iPhone/i.test(userAgent)) {
    deviceCategory = 'Mobile';
  }

  let browserCategory = 'Other';
  if (/Edg\//i.test(userAgent)) {
    browserCategory = 'Edge';
  } else if (/Chrome\//i.test(userAgent) && !/Chromium|Edg\//i.test(userAgent)) {
    browserCategory = 'Chrome';
  } else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    browserCategory = 'Safari';
  } else if (/Firefox\//i.test(userAgent)) {
    browserCategory = 'Firefox';
  } else if (/MSIE|Trident/i.test(userAgent)) {
    browserCategory = 'IE';
  }

  return {
    deviceCategory,
    browserCategory,
    summary: `${deviceCategory} (${browserCategory})`
  };
}

/**
 * Cleans and normalizes raw referrer into high-level source without query string leaks
 */
export function parseReferrer(rawReferrer) {
  if (!rawReferrer || typeof rawReferrer !== 'string' || !rawReferrer.trim()) {
    return 'Direct';
  }
  try {
    const url = new URL(rawReferrer);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('google')) return 'Google Search';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('bing')) return 'Bing Search';
    if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) return 'X (Twitter)';
    if (host.includes('github')) return 'GitHub';
    return host;
  } catch {
    return rawReferrer.slice(0, 100);
  }
}

// Known residential / mobile telecom keywords in PTR hostnames
const RESIDENTIAL_ISP_KEYWORDS = [
  'airtel', 'jio', 'bsnl', 'vsnl', 'hathway', 'actcorp', 'tatapower',
  'comcast', 'verizon', 'charter', 'spectrum', 'rr.com', 'att.net',
  'sbcglobal', 'cox.net', 'vodafone', 'btcentralplus', 'orange',
  'telecom', 'broadband', 'dsl', 'dynamic', 'pool', 'dhcp', 'user',
  'cust', 'dial', 'cable', 'res', 'ftth', 'mobile', 'gprs', 'lte'
];

// Known cloud / hosting / bot networks in PTR hostnames
const CLOUD_HOSTING_KEYWORDS = [
  'amazonaws.com', 'aws.', 'googleusercontent.com', 'googlebot.com',
  'azure.com', 'msn.com', 'bingbot', 'cloudflare.com', 'digitalocean.com',
  'linode.com', 'hetzner.de', 'hetzner.com', 'ovh.net', 'ovh.com',
  'oraclecloud.com', 'fastly.net', 'akamai.net', 'vultr.com', 'leaseweb'
];

/**
 * Zero-cost, legal network & organization identification via reverse DNS (PTR).
 * Does not make external paid API calls or violate privacy guidelines.
 */
export async function identifyNetwork(ip) {
  if (!ip || typeof ip !== 'string') {
    return {
      networkOrg: 'Anonymous Visitor',
      networkDomain: null,
      networkType: 'Anonymous / Unresolved',
      networkConfidence: 'None',
      disclaimer: 'Unresolved IP address. Fully anonymous.'
    };
  }

  const cleanIp = ip.replace(/^::ffff:/, '').trim();

  // Handle local development / private addresses
  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.')
  ) {
    return {
      networkOrg: 'Localhost / Internal Development',
      networkDomain: 'localhost',
      networkType: 'Local Development Network',
      networkConfidence: 'Verified (Local)',
      disclaimer: 'Internal development environment traffic.'
    };
  }

  // Check in-memory PTR cache
  const cached = dnsCache.get(cleanIp);
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    return cached.data;
  }

  let hostnames = [];
  try {
    hostnames = await dns.reverse(cleanIp);
  } catch (err) {
    // Reverse DNS lookup failed or not found (normal for many consumer IPs)
  }

  let result = {
    networkOrg: 'Anonymous Network',
    networkDomain: null,
    networkType: 'Anonymous / Unresolved',
    networkConfidence: 'Low (Unresolved)',
    disclaimer: 'PTR record could not be resolved. Visitor remains completely anonymous.'
  };

  if (hostnames && hostnames.length > 0) {
    const ptr = hostnames[0].toLowerCase();
    const domainParts = ptr.split('.');
    const rootDomain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : ptr;

    // Check if Cloud / Hosting / Crawler
    const isCloud = CLOUD_HOSTING_KEYWORDS.some((kw) => ptr.includes(kw));
    if (isCloud) {
      result = {
        networkOrg: `Cloud / Hosting (${rootDomain})`,
        networkDomain: rootDomain,
        networkType: 'Cloud / Datacenter / Bot',
        networkConfidence: 'Infrastructure',
        disclaimer: 'Data center, proxy, VPN, or search crawler IP address.'
      };
    } else {
      // Check if Residential / Mobile Consumer ISP
      const isISP = RESIDENTIAL_ISP_KEYWORDS.some((kw) => ptr.includes(kw));
      if (isISP) {
        result = {
          networkOrg: `Consumer Telecom (${rootDomain})`,
          networkDomain: rootDomain,
          networkType: 'ISP / Telecom Network',
          networkConfidence: 'Low (Consumer/Mobile)',
          disclaimer: 'Consumer broadband/mobile network. Does not indicate a specific corporate entity.'
        };
      } else {
        // Potential Organizational / Enterprise Network
        // Clean up domain name into readable organization candidate
        const orgName = domainParts.length >= 2
          ? domainParts[domainParts.length - 2].toUpperCase()
          : ptr;

        result = {
          networkOrg: `${orgName} Network (${rootDomain})`,
          networkDomain: rootDomain,
          networkType: 'Corporate / Institutional Network',
          networkConfidence: 'Moderate (Network-Level)',
          disclaimer: 'Organization-level network identification. Does not prove individual identity.'
        };
      }
    }
  }

  // Save to cache
  if (dnsCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = dnsCache.keys().next().value;
    dnsCache.delete(oldestKey);
  }
  dnsCache.set(cleanIp, { timestamp: Date.now(), data: result });

  return result;
}

/**
 * Extracts approximate location from standard proxy / CDN headers if available
 */
export function extractGeoFromHeaders(req) {
  const country =
    req.headers['cf-ipcountry'] ||
    req.headers['x-country-code'] ||
    req.headers['x-vercel-ip-country'] ||
    'Unknown';

  const region =
    req.headers['x-vercel-ip-country-region'] ||
    req.headers['x-region'] ||
    '';

  const city =
    req.headers['x-vercel-ip-city'] ||
    req.headers['x-city'] ||
    '';

  return {
    country: country.toUpperCase(),
    region,
    city
  };
}
