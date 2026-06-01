import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import seoData from "@/content/seo.json";

/**
 * Google Analytics 4 loader. Inert unless `seo.json` has a `googleAnalyticsId`
 * (a `G-XXXXXXXXXX` Measurement ID, editable in admin → SEO). Loads gtag once,
 * disables the automatic page_view, and sends one per SPA navigation instead.
 * No ID → nothing loads (privacy-safe default, no cookies).
 */
const GA_ID = ((seoData.googleAnalyticsId as string | null) ?? "").trim();

export function Analytics() {
  const [location] = useLocation();
  const loaded = useRef(false);

  useEffect(() => {
    if (!GA_ID || loaded.current) return;
    loaded.current = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", GA_ID, { send_page_view: false });
  }, []);

  useEffect(() => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (GA_ID && w.gtag) w.gtag("event", "page_view", { page_path: location });
  }, [location]);

  return null;
}
