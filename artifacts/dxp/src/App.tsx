import { useEffect } from "react";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@/components/Analytics";
import { PublicWebsite } from "@/pages/public/PublicWebsite";
import { LegalPage } from "@/pages/public/LegalPage";
import { AdminRouter } from "@/pages/admin/AdminRouter";
import NotFound from "@/pages/not-found";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";
import {
  SECTION_SLUGS,
  LEGAL_SLUGS,
  isLang,
  getDefaultLang,
  localizedPath,
} from "@/lib/sections";

const queryClient = new QueryClient();

const SECTION_SET = new Set<string>(SECTION_SLUGS);
const LEGAL_SET = new Set<string>(LEGAL_SLUGS);

/**
 * Resolves a 1–2 segment public path. Handles language-prefixed routes
 * (`/es`, `/en/products`, `/es/privacy`), redirects legacy un-prefixed paths
 * (`/products` → `/es/products`), and keeps i18n in sync with the URL language.
 */
function PublicRouter({ seg1, seg2 }: { seg1: string; seg2?: string }) {
  const { i18n } = useTranslation();
  const urlLang = isLang(seg1) ? seg1 : null;

  useEffect(() => {
    if (urlLang && i18n.language !== urlLang) {
      i18n.changeLanguage(urlLang);
      try {
        localStorage.setItem("pcl-lang", urlLang);
      } catch {
        /* ignore */
      }
    }
  }, [urlLang, i18n]);

  if (urlLang) {
    if (!seg2) return <PublicWebsite />;
    if (LEGAL_SET.has(seg2)) return <LegalPage page={seg2 as (typeof LEGAL_SLUGS)[number]} />;
    if (SECTION_SET.has(seg2)) return <PublicWebsite />;
    return <NotFound />;
  }

  // Legacy un-prefixed path: redirect known pages to the default language.
  if (SECTION_SET.has(seg1) || LEGAL_SET.has(seg1)) {
    return <Redirect to={localizedPath(getDefaultLang(), seg2 ? `${seg1}/${seg2}` : seg1)} replace />;
  }
  return <NotFound />;
}

function Router() {
  return (
    <Switch>
      {/* Admin CMS is a local-only authoring tool — not registered in
          production builds, so `/admin` falls through to 404 there. */}
      {ADMIN_ENABLED && <Route path="/admin" component={AdminRouter} />}
      {ADMIN_ENABLED && <Route path="/admin/:rest*" component={AdminRouter} />}

      {/* Root → default-language home. */}
      <Route path="/">{() => <Redirect to={localizedPath(getDefaultLang())} replace />}</Route>

      {/* Language-prefixed public routes (also catches legacy 1–2 segment paths). */}
      <Route path="/:seg1/:seg2?">
        {(params) => <PublicRouter seg1={params.seg1!} seg2={params.seg2} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""}>
          <Analytics />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
