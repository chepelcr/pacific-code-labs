import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicWebsite } from "@/pages/public/PublicWebsite";
import { AdminRouter } from "@/pages/admin/AdminRouter";
import NotFound from "@/pages/not-found";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";
import { SECTION_SLUGS } from "@/lib/sections";

const queryClient = new QueryClient();

const SECTION_SET = new Set<string>(SECTION_SLUGS);

function Router() {
  return (
    <Switch>
      {/* Admin CMS is a local-only authoring tool — its routes are not
          registered in production builds, so `/admin` falls through to 404. */}
      {ADMIN_ENABLED && <Route path="/admin" component={AdminRouter} />}
      {ADMIN_ENABLED && <Route path="/admin/:rest*" component={AdminRouter} />}
      {/* Public landing page. A single optional path segment selects the
          section to scroll to (clean paths, no `#`). Unknown slugs 404.
          PublicWebsite stays mounted across section changes. */}
      <Route path="/:section?">
        {(params) =>
          !params.section || SECTION_SET.has(params.section) ? (
            <PublicWebsite />
          ) : (
            <NotFound />
          )
        }
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
