import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import navigationData from "@/content/navigation.json";

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

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0F172A]/95 backdrop-blur-md shadow-lg border-b border-white/5"
          : "bg-transparent"
      }`}
      data-testid="public-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-white font-semibold tracking-tight hidden sm:block">
              Pacific Code Labs
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" data-testid="nav-links">
            {[...navigationData.items]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                  data-testid={`nav-link-${item.href.replace("#", "")}`}
                >
                  {item.label[lang] ?? item.label.es}
                </a>
              ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 text-sm font-medium transition-all"
              data-testid="lang-toggle"
              title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase text-xs font-semibold">{lang}</span>
            </button>

            {/* Dark / light toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all"
              data-testid="theme-toggle"
              title={dark ? "Modo claro" : "Modo oscuro"}
            >
              {dark
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin link */}
            <a
              href="/admin"
              className="hidden sm:block px-2 py-1.5 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-all"
              data-testid="admin-link"
            >
              Admin
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all"
              data-testid="mobile-menu-toggle"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0F172A]/98 backdrop-blur-md border-t border-white/5 px-4 py-4 space-y-1">
          {[...navigationData.items]
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block text-white/70 hover:text-white text-sm font-medium py-2 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {item.label[lang] ?? item.label.es}
              </a>
            ))}
        </div>
      )}
    </header>
  );
}
