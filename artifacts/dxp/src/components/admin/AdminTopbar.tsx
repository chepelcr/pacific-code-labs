import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Sun, Moon, ExternalLink, UploadCloud, Loader2, Check, AlertCircle, Info } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useDarkMode } from "@/lib/theme";
import { publishChanges } from "@/lib/local-cms";

interface Props {
  /** Opens the mobile sidebar drawer (only shown below lg). */
  onMenu: () => void;
}

type PublishState =
  | { kind: "idle" }
  | { kind: "publishing" }
  | { kind: "success"; hash: string }
  | { kind: "nothing" }
  | { kind: "error"; error: string };

/**
 * Admin top navbar: theme toggle, a link back to the public site, and the
 * one-click Publish button (commits the content JSON and pushes the current
 * branch via the dev-only local-cms endpoint). Dev-only chrome — the whole
 * admin panel is tree-shaken out of production by ADMIN_ENABLED.
 */
export function AdminTopbar({ onMenu }: Props) {
  const { t } = useTranslation();
  const { dark, toggle } = useDarkMode();
  const [state, setState] = useState<PublishState>({ kind: "idle" });

  const publish = async () => {
    if (state.kind === "publishing") return;
    setState({ kind: "publishing" });
    const res = await publishChanges();
    if (res.ok && res.nothingToPublish) {
      setState({ kind: "nothing" });
    } else if (res.ok) {
      setState({ kind: "success", hash: res.hash ?? "" });
    } else {
      setState({ kind: "error", error: res.error ?? "error" });
    }
    // Auto-reset back to idle after a few seconds (errors linger a bit longer).
    window.setTimeout(() => setState({ kind: "idle" }), res.ok ? 4000 : 8000);
  };

  // Publish button appearance per state.
  const publishStyles: Record<PublishState["kind"], string> = {
    idle: "bg-primary text-primary-foreground hover:bg-primary/90",
    publishing: "bg-primary/80 text-primary-foreground cursor-wait",
    success: "bg-emerald-600 text-white",
    nothing: "bg-muted text-muted-foreground",
    error: "bg-destructive text-destructive-foreground",
  };

  const publishContent = () => {
    switch (state.kind) {
      case "publishing":
        return (<><Loader2 className="w-4 h-4 animate-spin" />{t("admin.publishing")}</>);
      case "success":
        return (<><Check className="w-4 h-4" />{t("admin.published")}{state.hash && ` · ${state.hash}`}</>);
      case "nothing":
        return (<><Info className="w-4 h-4" />{t("admin.nothingToPublish")}</>);
      case "error":
        return (<><AlertCircle className="w-4 h-4" />{t("admin.publishError")}</>);
      default:
        return (<><UploadCloud className="w-4 h-4" />{t("admin.publish")}</>);
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-card border-b border-border"
      data-testid="admin-topbar"
    >
      {/* Mobile drawer toggle */}
      <button
        onClick={onMenu}
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
        data-testid="mobile-menu-btn"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <Logo size={24} />
        <span className="text-foreground font-semibold text-sm">Admin</span>
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
        data-testid="admin-theme-toggle"
        title={dark ? t("admin.themeLight") : t("admin.themeDark")}
        aria-label="Toggle theme"
      >
        <Sun className="absolute w-4 h-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
      </button>

      {/* View public site */}
      <a
        href="/"
        className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium transition-colors"
        data-testid="admin-view-site"
        title={t("admin.viewSite")}
      >
        <ExternalLink className="w-4 h-4" />
        <span className="hidden md:inline">{t("admin.viewSite")}</span>
      </a>

      {/* Publish */}
      <button
        onClick={publish}
        disabled={state.kind === "publishing"}
        className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-90 ${publishStyles[state.kind]}`}
        data-testid="admin-publish"
        title={state.kind === "error" ? state.error : t("admin.publish")}
      >
        {publishContent()}
      </button>
    </header>
  );
}
