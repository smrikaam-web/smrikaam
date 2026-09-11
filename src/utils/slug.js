/**
 * Safely sanitizes and extracts a clean, URL-friendly slug from any string,
 * full URL, path, or title.
 * 
 * Handles cases like:
 * - "https://smrikaam.com/content-writing-services-in-coimbatore/" -> "content-writing-services-in-coimbatore"
 * - "https:/smrikaam.com/content-writing-services-in-coimbatore/" -> "content-writing-services-in-coimbatore"
 * - "/blog/https:/smrikaam.com/content-writing-services-in-coimbatore/" -> "content-writing-services-in-coimbatore"
 * - "/blog/content-writing-services-in-coimbatore/" -> "content-writing-services-in-coimbatore"
 * - "Content Writing Services in Coimbatore!" -> "content-writing-services-in-coimbatore"
 */
export function cleanSlug(input) {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim();

  // Decode URI component if encoded
  try {
    str = decodeURIComponent(str);
  } catch (e) {
    // Ignore decoding errors
  }

  // Remove leading slashes and any repeated prefix routing like /blog/, /services/, etc.
  str = str.replace(/^(?:\/?(?:blog|services|products|accelerators|industries|case-studies)\/)+/i, '');

  // Remove any protocol variations like http://, https://, http:/, https:/
  str = str.replace(/https?:\/+/i, '');

  // Remove domain names if present (e.g. smrikaam.com, www.smrikaam.com, localhost:5173)
  str = str.replace(/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?\/?/i, '');
  str = str.replace(/^localhost(?::\d+)?\/?/i, '');

  // Remove prefix paths again if they were placed after the domain (e.g. smrikaam.com/blog/slug)
  str = str.replace(/^(?:blog|services|products|accelerators|industries|case-studies)\//i, '');

  // Strip leading and trailing slashes
  str = str.replace(/^\/+|\/+$/g, '');

  // Convert to clean kebab-case slug
  str = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return str;
}

export default cleanSlug;
