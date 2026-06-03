import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/shared/Logo";
import { getBranding } from "@/repositories/branding.repository";
import { guardNavigation } from "@/lib/admin-ui";
import {
  LayoutDashboard, Package, Wrench, BookOpen, HelpCircle, Mail,
  Search, Navigation, LayoutTemplate, Globe, Image,
  Download, Settings, FileSearch, Activity, ChevronLeft,
  ChevronRight, ChevronDown, X, Brush, Sparkles, Lightbulb, Scale, Languages, Share2, Info,
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    groupKey: "admin.business",
    items: [
      { href: "/admin/dashboard",        labelKey: "admin.dashboard",      icon: LayoutDashboard },
      { href: "/admin/hero",              labelKey: "admin.hero",           icon: Sparkles },
      { href: "/admin/about",             labelKey: "admin.about",          icon: Info },
      { href: "/admin/products",          labelKey: "admin.products",       icon: Package },
      { href: "/admin/services",          labelKey: "admin.services",       icon: Wrench },
      { href: "/admin/case-studies",      labelKey: "admin.caseStudies",    icon: BookOpen },
      { href: "/admin/philosophy",        labelKey: "admin.philosophy",     icon: Lightbulb },
      { href: "/admin/faq",               labelKey: "admin.faq",            icon: HelpCircle },
      { href: "/admin/contact",           labelKey: "admin.contact",        icon: Mail },
      { href: "/admin/seo",               labelKey: "admin.seo",            icon: Search },
      { href: "/admin/navigation",        labelKey: "admin.navigation",     icon: Navigation },
      { href: "/admin/footer",            labelKey: "admin.footer",         icon: LayoutTemplate },
      { href: "/admin/legal",             labelKey: "admin.legal",          icon: Scale },
    ],
  },
  {
    groupKey: "admin.cms",
    items: [
      { href: "/admin/identity",          labelKey: "admin.identity.nav",   icon: Brush },
      { href: "/admin/media",             labelKey: "admin.media.nav",      icon: Image },
      { href: "/admin/languages",         labelKey: "admin.languages",      icon: Globe },
      { href: "/admin/translations",      labelKey: "admin.translations",   icon: Languages },
      { href: "/admin/content-versions",  labelKey: "admin.contentVersions",icon: Download },
      { href: "/admin/settings",          labelKey: "admin.settings",       icon: Settings },
    ],
  },
  {
    groupKey: "admin.platform",
    items: [
      { href: "/admin/content-explorer",  labelKey: "admin.contentExplorer",icon: FileSearch },
      { href: "/admin/inventory",         labelKey: "admin.inventory",      icon: Share2 },
      { href: "/admin/diagnostics",       labelKey: "admin.diagnostics",    icon: Activity },
    ],
  },
];

function getActiveGroup(location: string): string {
  for (const group of NAV) {
    if (group.items.some((i) => location === i.href || location.startsWith(i.href + "/"))) {
      return group.groupKey;
    }
  }
  return NAV[0].groupKey;
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function AdminSidebar({ collapsed, onToggle, onClose }: Props) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [openGroup, setOpenGroup] = useState<string>(() => getActiveGroup(location));
  const branding = getBranding();

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    // Block the jump and prompt when the open page has unsaved edits.
    if (guardNavigation(href)) {
      e.preventDefault();
      return;
    }
    // On mobile, close the overlay drawer when a link is clicked
    onClose?.();
  };

  const toggleGroup = (groupKey: string) => {
    setOpenGroup((prev) => (prev === groupKey ? "" : groupKey));
  };

  return (
    <aside
      className={`relative h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      data-testid="admin-sidebar"
    >
      {/* Edge collapse/expand tab (desktop) — floats on the right border */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-16 z-20 w-6 h-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-md ring-2 ring-background hover:bg-sidebar-primary/90 transition-colors"
        data-testid="sidebar-edge-toggle"
        title={collapsed ? "Expandir" : "Colapsar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo row */}
      <div
        className={`flex items-center h-14 border-b border-sidebar-border px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {collapsed ? (
          <Logo size={28} />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <Logo size={28} />
            <span className="text-sidebar-foreground text-sm font-semibold truncate">{branding.companyName}</span>
          </div>
        )}

        {/* Mobile close (desktop collapse lives on the floating edge tab only) */}
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/40 hover:text-sidebar-foreground p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV.map((group) => {
          const isOpen = collapsed || openGroup === group.groupKey;
          const hasActive = group.items.some(
            (i) => location === i.href || location.startsWith(i.href + "/")
          );

          return (
            <div key={group.groupKey}>
              {/* Group header — hidden when sidebar is collapsed */}
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.groupKey)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg mb-0.5 transition-colors group ${
                    hasActive && !isOpen
                      ? "text-sidebar-foreground/60"
                      : "text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
                  }`}
                  data-testid={`sidebar-group-${group.groupKey}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t(group.groupKey)}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
              )}

              {/* Items — grid-rows 1fr→0fr animates the group open/close. */}
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active =
                        location === item.href || location.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleNavClick(item.href)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          } ${collapsed ? "justify-center" : ""}`}
                          data-testid={`sidebar-link-${item.href.split("/").pop()}`}
                          title={collapsed ? t(item.labelKey) : undefined}
                        >
                          <item.icon
                            className={`flex-shrink-0 ${collapsed ? "w-5 h-5" : "w-4 h-4"}`}
                          />
                          {!collapsed && (
                            <span className="truncate">{t(item.labelKey)}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "text-center" : ""}`}>
        <Link
          href="/"
          onClick={handleNavClick("/")}
          className="flex items-center gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground/80 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-sidebar-accent"
        >
          <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>{t("common.back_home")}</span>}
        </Link>
      </div>
    </aside>
  );
}
