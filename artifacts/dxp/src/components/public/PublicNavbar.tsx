import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import navigationData from "@/content/navigation.json";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";

function getInitialDark(): boolean {
  const stored = localStorage.getItem("pcl-theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("pcl-theme", dark ? "dark" : "light");
}

export function PublicNavbar() {
  const { i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return getInitialDark(); } catch { return false; }
  });
  const lang = i18n.language as "es" | "en";

  useEffect(() => { applyTheme(dark); }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    i18n.changeLanguage(next);
    localStorage.setItem("pcl-lang", next);
  };

  const toggleTheme = () => setDark((d) => !d);

  /* Tailwind classes change between light/dark based on the `.dark` class on <html> */
  const navBg = scrolled
    ? "bg-white/95 dark:bg-[#0F172A]/95 shadow-sm dark:shadow-none border-b border-[#E2E8F0]/80 dark:border-white/5 backdrop-blur-md"
    : "bg-transparent";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`} data-testid="public-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo size={36} />
            <span className="text-[#0F172A] dark:text-white font-semibold tracking-tight hidden sm:block">
              Pacific Code Labs
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" data-testid="nav-links">
            {[...navigationData.items]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#475569] hover:text-[#0F172A] dark:text-white/70 dark:hover:text-white text-sm font-medium transition-colors"
                  data-testid={`nav-link-${item.href.replace(/^\//, "")}`}
                >
                  {item.label[lang] ?? item.label.es}
                </Link>
              ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Language toggle — globe spins on hover, label cross-fades on switch */}
            <button
              onClick={toggleLang}
              className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[#475569] hover:text-[#0F172A] dark:text-white/60 dark:hover:text-white hover:bg-[#0F172A]/6 dark:hover:bg-white/8 text-sm font-medium transition-all duration-300"
              data-testid="lang-toggle"
              title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
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
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block text-[#475569] hover:text-[#0F172A] dark:text-white/70 dark:hover:text-white text-sm font-medium py-2 px-2 rounded-lg hover:bg-[#0F172A]/5 dark:hover:bg-white/5 transition-colors"
              >
                {item.label[lang] ?? item.label.es}
              </Link>
            ))}
        </div>
      )}
    </header>
  );
}
