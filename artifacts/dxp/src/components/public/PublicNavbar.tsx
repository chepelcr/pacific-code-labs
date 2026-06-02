import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import navigationData from "@/content/navigation.json";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";
import { isLang, localizedPath, localizeHref, pathLang } from "@/lib/sections";
import { useDarkMode } from "@/lib/theme";

export function PublicNavbar() {
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { dark, toggle: toggleTheme } = useDarkMode();
  const lang = pathLang(location);

  // Current slug (path without the language prefix), e.g. "" | "products" | "privacy".
  const segs = location.replace(/^\/+/, "").replace(/\/+$/, "").split("/").filter(Boolean);
  const slug = segs.length && isLang(segs[0]) ? segs.slice(1).join("/") : segs.join("/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    const apply = () => {
      localStorage.setItem("pcl-lang", next);
      // Navigate to the same page under the other language prefix; the router
      // syncs i18n from the URL.
      navigate(localizedPath(next, slug));
    };
    const el = document.getElementById("page-content");
    if (!el) {
      apply();
      return;
    }
    // Animate the content out, swap language, then animate it back in.
    el.classList.add("lang-anim-out");
    window.setTimeout(() => {
      apply();
      el.classList.remove("lang-anim-out");
      el.classList.add("lang-anim-in");
      window.setTimeout(() => el.classList.remove("lang-anim-in"), 340);
    }, 220);
  };

  /* Tailwind classes change between light/dark based on the `.dark` class on <html> */
  const navBg = scrolled
    ? "bg-white/95 dark:bg-[#0F172A]/95 shadow-sm dark:shadow-none border-b border-[#E2E8F0]/80 dark:border-white/5 backdrop-blur-md"
    : "bg-transparent";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`} data-testid="public-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={localizedPath(lang)} className="flex items-center gap-2">
            <Logo size={36} />
            <span className="text-[#0F172A] dark:text-white font-semibold tracking-tight text-sm sm:text-base">
              Pacific Code Labs
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" data-testid="nav-links">
            {[...navigationData.items]
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const active = slug === item.href.replace(/^\//, "").replace(/\/$/, "");
                return (
                  <Link
                    key={item.href}
                    href={localizeHref(lang, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-[#2563EB] dark:after:bg-[#06B6D4] after:transition-all after:duration-300 ${
                      active
                        ? "text-[#2563EB] dark:text-[#06B6D4] after:w-full"
                        : "text-[#475569] hover:text-[#0F172A] dark:text-white/70 dark:hover:text-white after:w-0 hover:after:w-full"
                    }`}
                    data-testid={`nav-link-${item.href.replace(/^\//, "")}`}
                  >
                    {item.label[lang] ?? item.label.es}
                  </Link>
                );
              })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Language toggle — globe spins on hover, label cross-fades on switch */}
            <button
              onClick={toggleLang}
              className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[#475569] hover:text-[#0F172A] dark:text-white/60 dark:hover:text-white hover:bg-[#0F172A]/6 dark:hover:bg-white/8 text-sm font-medium transition-all duration-300"
              data-testid="lang-toggle"
              title={t("common.toggle_language")}
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
              <span
                key={lang}
                className="uppercase text-xs font-semibold inline-block animate-in fade-in zoom-in-95 duration-300"
              >
                {lang}
              </span>
            </button>

            {/* Dark / light toggle — Sun/Moon rotate + scale cross-fade */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#475569] hover:text-[#0F172A] dark:text-white/60 dark:hover:text-white hover:bg-[#0F172A]/6 dark:hover:bg-white/8 transition-all duration-300"
              data-testid="theme-toggle"
              title={dark ? "Modo claro" : "Modo oscuro"}
              aria-label="Toggle theme"
            >
              <Sun className="absolute w-4 h-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
            </button>

            {/* Admin link — only rendered when the admin CMS is enabled
                (dev builds); hidden in public production builds. */}
            {ADMIN_ENABLED && (
              <a
                href="/admin"
                className="hidden sm:block px-2 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-[#475569] dark:text-white/35 dark:hover:text-white/60 hover:bg-[#0F172A]/5 dark:hover:bg-white/5 transition-all"
                data-testid="admin-link"
              >
                Admin
              </a>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-[#475569] hover:text-[#0F172A] dark:text-white/60 dark:hover:text-white hover:bg-[#0F172A]/6 dark:hover:bg-white/8 transition-all"
              data-testid="mobile-menu-toggle"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#0F172A]/98 backdrop-blur-md border-t border-[#E2E8F0] dark:border-white/5 px-4 py-4 space-y-1">
          {[...navigationData.items]
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const active = slug === item.href.replace(/^\//, "").replace(/\/$/, "");
              return (
                <Link
                  key={item.href}
                  href={localizeHref(lang, item.href)}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`block text-sm font-medium py-2 px-2 rounded-lg transition-colors ${
                    active
                      ? "text-[#2563EB] dark:text-[#06B6D4] bg-[#2563EB]/8 dark:bg-white/5"
                      : "text-[#475569] hover:text-[#0F172A] dark:text-white/70 dark:hover:text-white hover:bg-[#0F172A]/5 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label[lang] ?? item.label.es}
                </Link>
              );
            })}
        </div>
      )}
    </header>
  );
}
