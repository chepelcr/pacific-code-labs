import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/shared/Logo";
import {
  LayoutDashboard, Package, Wrench, BookOpen, HelpCircle, Mail,
  Search, Navigation, LayoutTemplate, Globe, Palette, Image,
  Download, Settings, FileSearch, Activity, ChevronLeft,
  ChevronRight, ChevronDown, X, Brush, Sparkles, Lightbulb, Scale,
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
      { href: "/admin/languages",         labelKey: "admin.languages",      icon: Globe },
      { href: "/admin/themes",            labelKey: "admin.themes",         icon: Palette },
      { href: "/admin/media",             labelKey: "admin.media",          icon: Image },
      { href: "/admin/content-versions",  labelKey: "admin.contentVersions",icon: Download },
      { href: "/admin/settings",          labelKey: "admin.settings",       icon: Settings },
      { href: "/admin/branding",          labelKey: "admin.branding",       icon: Brush },
    ],
  },
  {
    groupKey: "admin.platform",
    items: [
      { href: "/admin/content-explorer",  labelKey: "admin.contentExplorer",icon: FileSearch },
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

  const handleNavClick = () => {
    // On mobile, close the overlay drawer when a link is clicked
    onClose?.();
  };

  const toggleGroup = (groupKey: string) => {
    setOpenGroup((prev) => (prev === groupKey ? "" : groupKey));
  };

  return (
    <aside
      className={`h-full bg-[#0F172A] border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      data-testid="admin-sidebar"
    >
      {/* Logo row */}
      <div
        className={`flex items-center h-14 border-b border-white/5 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {collapsed ? (
          <Logo size={28} />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <Logo size={28} />
            <span className="text-white text-sm font-semibold truncate">Pacific Code Labs</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* Mobile close */}
          {onClose && !collapsed && (
            <button
              onClick={onClose}
              className="lg:hidden text-white/30 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex text-white/30 hover:text-white p-1 rounded transition-colors"
            data-testid="sidebar-toggle"
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
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
                      ? "text-white/50"
                      : "text-white/25 hover:text-white/50"
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

              {/* Items — shown only when group is open (or sidebar is collapsed) */}
              {isOpen && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      location === item.href || location.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleNavClick}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          active
                            ? "bg-[#2563EB] text-white"
                            : "text-white/50 hover:text-white hover:bg-white/5"
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
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/5 p-3 ${collapsed ? "text-center" : ""}`}>
        <Link
          href="/"
          onClick={handleNavClick}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>{t("common.back_home")}</span>}
        </Link>
      </div>
    </aside>
  );
}
