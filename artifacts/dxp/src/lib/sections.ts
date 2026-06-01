/**
 * Public landing page is a single scrollable document. Each section is
 * addressable by a clean, language-prefixed path (e.g. `/es/products`,
 * `/en/products`) that maps 1:1 to the section element's `id`. The per-language
 * home is `/es` or `/en`; `/` redirects to the default language.
 *
 * Routing is path-based (History API via wouter) — no `#` hash anchors. The
 * router renders `PublicWebsite` for every section path, and `PublicWebsite`
 * smooth-scrolls to the matching section whenever the location changes.
 */

/** Section slugs in document order. Slug === path segment === element id. */
export const SECTION_SLUGS = [
  "products",
  "services",
  "about",
  "philosophy",
  "case-studies",
  "contact",
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

/** Standalone (non-section) public pages that also live under a language prefix. */
export const LEGAL_SLUGS = ["privacy", "terms"] as const;

/** Supported URL languages (the language prefix). */
export const LANGUAGES = ["es", "en"] as const;
export type UrlLang = (typeof LANGUAGES)[number];

export function isLang(s: string | undefined): s is UrlLang {
  return s === "es" || s === "en";
}

/** Default language: persisted choice if valid, else Spanish. */
export function getDefaultLang(): UrlLang {
  try {
    const s = localStorage.getItem("pcl-lang");
    if (isLang(s ?? undefined)) return s as UrlLang;
  } catch {
    /* no localStorage (SSR/prerender) */
  }
  return "es";
}

/** Build a language-prefixed path. Empty/undefined slug → the language home. */
export function localizedPath(lang: string, slug?: string): string {
  const s = (slug ?? "").replace(/^\/+/, "").replace(/\/+$/, "");
  return s ? `/${lang}/${s}` : `/${lang}`;
}

/** Localize an internal href; external/anchor/mailto links pass through. */
export function localizeHref(lang: string, href: string): string {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  return localizedPath(lang, href);
}

/** The language segment of a path, or the default when absent. */
export function pathLang(path: string): UrlLang {
  const first = path.replace(/^\/+/, "").split("/")[0];
  return isLang(first) ? first : getDefaultLang();
}

/** Map a router location to the id of the element to scroll to (lang-aware). */
export function pathToSectionId(path: string): string {
  const parts = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length && isLang(parts[0])) parts.shift();
  return parts[0] || "hero";
}
