import { Route, Switch, Redirect } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "./DashboardPage";
import { ProductsPage } from "./ProductsPage";
import { ServicesPage } from "./ServicesPage";
import { CaseStudiesPage } from "./CaseStudiesPage";
import { FaqPage } from "./FaqPage";
import { ContactPage } from "./ContactPage";
import { SeoPage } from "./SeoPage";
import { NavigationPage } from "./NavigationPage";
import { FooterPage } from "./FooterPage";
import { LanguagesPage } from "./LanguagesPage";
import { ThemesPage } from "./ThemesPage";
import { MediaPage } from "./MediaPage";
import { ContentVersionsPage } from "./ContentVersionsPage";
import { SettingsPage } from "./SettingsPage";
import { ContentExplorerPage } from "./ContentExplorerPage";
import { DiagnosticsPage } from "./DiagnosticsPage";
import { BrandingPage } from "./BrandingPage";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";

export function AdminRouter() {
  // Defense in depth: even if these routes were ever registered, the admin
  // panel refuses to render in builds where it is disabled (e.g. production).
  if (!ADMIN_ENABLED) {
    return <Redirect to="/" />;
  }
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" component={DashboardPage} />
        <Route path="/admin/products" component={ProductsPage} />
        <Route path="/admin/services" component={ServicesPage} />
        <Route path="/admin/case-studies" component={CaseStudiesPage} />
        <Route path="/admin/faq" component={FaqPage} />
        <Route path="/admin/contact" component={ContactPage} />
        <Route path="/admin/seo" component={SeoPage} />
        <Route path="/admin/navigation" component={NavigationPage} />
        <Route path="/admin/footer" component={FooterPage} />
        <Route path="/admin/languages" component={LanguagesPage} />
        <Route path="/admin/themes" component={ThemesPage} />
        <Route path="/admin/media" component={MediaPage} />
        <Route path="/admin/content-versions" component={ContentVersionsPage} />
        <Route path="/admin/settings" component={SettingsPage} />
        <Route path="/admin/branding" component={BrandingPage} />
        <Route path="/admin/content-explorer" component={ContentExplorerPage} />
        <Route path="/admin/diagnostics" component={DiagnosticsPage} />
      </Switch>
    </AdminLayout>
  );
}
