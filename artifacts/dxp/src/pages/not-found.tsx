import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Home, Compass } from "lucide-react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { FooterSection } from "@/components/public/FooterSection";
import { useHeadTags, type Lang } from "@/lib/seo";

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language as Lang) ?? "es";

  // 404s should not be indexed.
  useHeadTags(
    {
      title: `${t("notFound.title")} — Pacific Code Labs`,
      description: t("notFound.subtitle"),
      canonical: "https://pacific-code-labs.jcampos.dev/",
      noindex: true,
    },
    lang,
  );

  // Land at the top regardless of how the user arrived here.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A]" data-testid="not-found-page">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4 pt-28 pb-20">
        {/* Same ambient decoration the public sections use */}
        <div className="absolute inset-0 grid-pattern opacity-20 dark:opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2563EB]/6 dark:bg-[#2563EB]/8 blur-3xl" />

        <div className="relative text-center max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2563EB]/25 dark:border-[#2563EB]/30 bg-[#2563EB]/8 dark:bg-[#2563EB]/10 text-[#2563EB] dark:text-[#06B6D4] text-xs font-semibold uppercase tracking-widest mb-6">
            <Compass className="w-3.5 h-3.5" />
            404
          </div>

          <p className="text-7xl sm:text-9xl font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4] mb-6">
            404
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white mb-3">
            {t("notFound.title")}
          </h1>
          <p className="text-[#64748B] dark:text-white/50 leading-relaxed mb-8">
            {t("notFound.subtitle")}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white font-semibold text-sm hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all shadow-lg shadow-[#2563EB]/25"
            data-testid="btn-back-home"
          >
            <Home className="w-4 h-4" />
            {t("notFound.cta")}
          </Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
