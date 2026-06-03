import brandingData from "@/content/branding.json";
import themesData from "@/content/themes.json";
import { resolveAssetUrl } from "@/lib/media";

/**
 * Brand palette → live CSS. Distinct from `theme.ts` (which owns the dark/light
 * `.dark` class). The active theme in `themes.json` drives the site's brand
 * colours at runtime:
 *
 * - Hex brand tokens (`--brand-primary/accent/emerald/navy/background`) feed the
 *   brand utility classes in `index.css` (`.bg-navy`, `.text-cyan`, gradients…).
 * - The semantic light-mode tokens (`--primary`, `--accent`, `--background`,
 *   `--ring`, `--chart-1/2`) are overridden via a `:root:not(.dark)` rule so the
 *   `.dark` palette (more specific class selector) keeps winning in dark mode.
 *
 * Applied as the text of a single managed `<style>` element so it never fights
 * inline styles and stays easy to update.
 */

type ThemeColors = (typeof themesData)[number]["colors"];
type Theme = (typeof themesData)[number];

const STYLE_ID = "pcl-brand-theme";

/** "#2563EB" → "221 83% 53%" (the `H S% L%` triplet our HSL vars expect). */
export function hexToHsl(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return "0 0% 0%";
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function buildCss(c: ThemeColors): string {
  const primary = hexToHsl(c.primary);
  const accent = hexToHsl(c.accent);
  const background = hexToHsl(c.background);
  return [
    ":root{",
    `--brand-primary:${c.primary};`,
    `--brand-accent:${c.accent};`,
    `--brand-emerald:${c.emerald};`,
    `--brand-navy:${c.navy};`,
    `--brand-background:${c.background};`,
    "}",
    // Scoped to light mode so the `.dark` class selector keeps precedence.
    ":root:not(.dark){",
    `--primary:${primary};`,
    `--ring:${primary};`,
    `--chart-1:${primary};`,
    `--accent:${accent};`,
    `--chart-2:${accent};`,
    `--background:${background};`,
    "}",
  ].join("");
}

/** Write the palette into the managed <style> element (creating it if needed). */
export function applyBrandTheme(theme: Theme | undefined): void {
  if (typeof document === "undefined" || !theme?.colors) return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildCss(theme.colors);
}

/** Point the document favicon at a (possibly relative) asset reference. */
export function applyFavicon(ref: string | null | undefined): void {
  if (typeof document === "undefined" || !ref) return;
  const href = resolveAssetUrl(ref);
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Boot-time runtime branding: apply the active theme's palette and the favicon
 * from `branding.json`. Called once from `main.tsx`.
 */
export function initBrand(): void {
  const active = themesData.find((t) => t.isActive) ?? themesData[0];
  applyBrandTheme(active);
  applyFavicon(brandingData.faviconUrl);
}
