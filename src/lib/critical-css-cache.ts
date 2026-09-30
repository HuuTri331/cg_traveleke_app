/**
 * Enterprise Critical CSS & Cache-State Controller
 * Implements First-Visit vs Repeat-Visit Cache Invalidation Strategy.
 * References: Sections 20-25 of CSS Critical Rendering Path Enterprise Architecture.
 */

export const CRITICAL_CSS_COOKIE_NAME = 'traveleke_css_cached_ver';
export const CURRENT_CSS_VERSION = 'v1.0.0-tailwind4';

/**
 * Checks if the request comes from a client that already has the current CSS version cached.
 * On server side (Node.js/Edge/Next.js Request): parses Cookie header.
 * On client side (Browser): parses document.cookie.
 */
export function hasCachedStylesheet(cookieHeaderOrString?: string | null): boolean {
  if (typeof window !== 'undefined') {
    // Client-side browser inspection
    const match = document.cookie.match(new RegExp(`(?:^|; )${CRITICAL_CSS_COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) === CURRENT_CSS_VERSION : false;
  }

  // Server-side / Edge inspection
  if (!cookieHeaderOrString) return false;
  const match = cookieHeaderOrString.match(new RegExp(`(?:^|; )${CRITICAL_CSS_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) === CURRENT_CSS_VERSION : false;
}

/**
 * Marks the client as having the current stylesheet cached in HTTP disk cache.
 * Sets an HTTP cookie with Max-Age of 30 days, SameSite=Lax.
 */
export function markStylesheetAsCached(): void {
  if (typeof window === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${CRITICAL_CSS_COOKIE_NAME}=${encodeURIComponent(
    CURRENT_CSS_VERSION
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Generates the Non-Critical Asynchronous CSS Preload Link snippet
 * Uses preload with onload callback and noscript fallback to eliminate render-blocking.
 */
export function generateAsyncStylesheetTag(href: string): string {
  return `
    <link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${href}"></noscript>
  `.trim();
}
