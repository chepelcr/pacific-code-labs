import { useTranslation } from "react-i18next";
import { Logo } from "@/components/shared/Logo";
import footerData from "@/content/footer.json";

export function FooterSection() {
  const { i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";

  return (
    <footer className="bg-[#F1F5F9] dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-white/5 py-10" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-[#475569] dark:text-white/60 text-sm">Pacific Code Labs</span>
          </div>

          {/* Copyright */}
          <p className="text-[#94A3B8] dark:text-white/30 text-xs text-center">
            {footerData.copyright[lang] ?? footerData.copyright.es}
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            {footerData.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-[#94A3B8] dark:text-white/30 hover:text-[#475569] dark:hover:text-white/60 text-xs transition-colors"
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
