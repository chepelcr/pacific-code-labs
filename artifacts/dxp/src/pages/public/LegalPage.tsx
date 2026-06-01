import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { FooterSection } from "@/components/public/FooterSection";
import legalData from "@/content/legal.json";

type LegalKey = keyof typeof legalData;

export function LegalPage({ page }: { page: LegalKey }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";
  const entry = legalData[page];
  const tr = entry.translations[lang] ?? entry.translations.es;

  // Open legal pages at the top, regardless of prior scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F172A]" data-testid={`legal-page-${page}`}>
      <PublicNavbar />

      <main id="page-content" className="flex-1 pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#64748B] dark:text-white/50 hover:text-[#2563EB] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back_home")}
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-2">
            {tr.title}
          </h1>
          <p className="text-sm text-[#94A3B8] dark:text-white/40 mb-10">{tr.updated}</p>

          <div className="text-[#475569] dark:text-white/70 leading-relaxed whitespace-pre-line text-justify text-[15px]">
            {tr.body}
          </div>
        </article>
      </main>

      <FooterSection />
    </div>
  );
}
