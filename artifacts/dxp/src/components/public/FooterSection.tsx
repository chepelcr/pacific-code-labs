import { useTranslation } from "react-i18next";
import footerData from "@/content/footer.json";

export function FooterSection() {
  const { i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";

  return (
    <footer className="bg-[#0F172A] border-t border-white/5 py-10" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-white/60 text-sm">Pacific Code Labs</span>
          </div>

          {/* Copyright */}
          <p className="text-white/30 text-xs text-center">
            {footerData.copyright[lang] ?? footerData.copyright.es}
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            {footerData.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-white/30 hover:text-white/60 text-xs transition-colors"
              >
                {link.label[lang] ?? link.label.es}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
