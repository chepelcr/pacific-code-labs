import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Package, Wrench, BookOpen, HelpCircle, Mail,
  Search, Navigation, LayoutTemplate, Globe, Palette, Image,
  Download, Settings, FileSearch, Activity, ChevronLeft,
  ChevronRight, X,
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
      { href: "/admin/dashboard", labelKey: "admin.dashboard", icon: LayoutDashboard },
      { href: "/admin/products", labelKey: "admin.products", icon: Package },
      { href: "/admin/services", labelKey: "admin.services", icon: Wrench },
      { href: "/admin/case-studies", labelKey: "admin.caseStudies", icon: BookOpen },
      { href: "/admin/faq", labelKey: "admin.faq", icon: HelpCircle },
      { href: "/admin/contact", labelKey: "admin.contact", icon: Mail },
      { href: "/admin/seo", labelKey: "admin.seo", icon: Search },
      { href: "/admin/navigation", labelKey: "admin.navigation", icon: Navigation },
      { href: "/admin/footer", labelKey: "admin.footer", icon: LayoutTemplate },
    ],
  },
  {
    groupKey: "admin.cms",
    items: [
      { href: "/admin/languages", labelKey: "admin.languages", icon: Globe },
      { href: "/admin/themes", labelKey: "admin.themes", icon: Palette },
      { href: "/admin/media", labelKey: "admin.media", icon: Image },
      { href: "/admin/content-versions", labelKey: "admin.contentVersions", icon: Download },
      { href: "/admin/settings", labelKey: "admin.settings", icon: Settings },
    ],
  },
  {
    groupKey: "admin.platform",
    items: [
      { href: "/admin/content-explorer", labelKey: "admin.contentExplorer", icon: FileSearch },
      { href: "/admin/diagnostics", labelKey: "admin.diagnostics", icon: Activity },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function AdminSidebar({ collapsed, onToggle, onClose }: Props) {
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <aside
      className={`h-full bg-[#0F172A] border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      data-testid="admin-sidebar"
    >
      {/* Logo row */}
      <div className={`flex items-center h-14 border-b border-white/5 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-white text-sm font-semibold truncate">Pacific Code Labs</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {onClose && !collapsed && (
            <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="hidden lg:flex text-white/30 hover:text-white p-1 transition-colors"
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
        {NAV.map((group) => (
          <div key={group.groupKey}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-white/20">
                {t(group.groupKey)}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-[#2563EB] text-white"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    } ${collapsed ? "justify-center" : ""}`}
                    data-testid={`sidebar-link-${item.href.split("/").pop()}`}
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    <item.icon className={`flex-shrink-0 ${active ? "text-white" : ""} ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} />
                    {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/5 p-3 ${collapsed ? "text-center" : ""}`}>
        <Link
          href="/"
          className="flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          <span className="w-4 h-4 text-center">←</span>
          {!collapsed && <span>{t("common.back_home")}</span>}
        </Link>
      </div>
    </aside>
  );
}
