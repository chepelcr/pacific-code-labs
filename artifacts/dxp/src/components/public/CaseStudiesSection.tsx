import { useTranslation } from "react-i18next";
import { TrendingUp, Zap, Tag } from "lucide-react";
import { parseRichText } from "@/lib/rich-text";
import { resolveAssetUrl } from "@/lib/media";
import { listActiveCaseStudies } from "@/services/caseStudies.service";

export function CaseStudiesSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";
  const cases = listActiveCaseStudies();

  const industryColors: Record<string, string> = {
    Agriculture: "#10B981",
    Engineering: "#F59E0B",
    Technology: "#2563EB",
    Gaming: "#8B5CF6",
    Retail: "#EC4899",
    default: "#06B6D4",
  };

  return (
    <section
      id="case-studies"
      className="py-24 bg-white dark:bg-[#0F172A]"
      data-testid="case-studies-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-semibold uppercase tracking-widest mb-4">
            {t("caseStudies.title")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
            {t("caseStudies.title")}
          </h2>
          <p className="text-[#64748B] dark:text-white/50 max-w-xl mx-auto">{t("caseStudies.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-x-8 gap-y-8 lg:gap-y-0 lg:grid-rows-[auto_auto_auto_auto]">
          {cases.map((cs) => {
            const tr = cs.translations[lang] ?? cs.translations.es;
            const color = industryColors[cs.industry ?? "default"] ?? industryColors.default;
            const blocks = [
              { key: "challenge", label: t("caseStudies.challenge"), icon: Zap, color: "#F59E0B" },
              { key: "solution", label: t("caseStudies.solution"), icon: Zap, color: "#2563EB" },
              { key: "result", label: t("caseStudies.result"), icon: TrendingUp, color: "#10B981" },
            ];

            return (
              <div
                key={cs.id}
                className="rounded-2xl border border-[#E2E8F0] dark:border-white/8 overflow-hidden hover:shadow-xl transition-all duration-300 lg:row-span-4 lg:grid lg:grid-rows-subgrid"
                data-testid={`case-study-card-${cs.id}`}
              >
                {/* Optional cover image (editable via admin → Case Studies). */}
                {cs.imageUrl && (
                  <img
                    src={resolveAssetUrl(cs.imageUrl)}
                    alt={typeof tr.title === "string" ? tr.title : ""}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                )}

                {/* Header — always dark gradient (intentional brand design element) */}
                <div
                  className="px-8 py-6 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, #0F172A, #1e3a5f)` }}
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
                    style={{ background: color }}
                  />
                  {cs.industry && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Tag className="w-3 h-3" style={{ color }} />
                      <span className="text-xs font-medium" style={{ color }}>
                        {cs.industry}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white relative z-10">{parseRichText(tr.title)}</h3>
                  <p className="text-white/60 text-sm mt-2 relative z-10">{parseRichText(tr.summary)}</p>
                </div>

                {/* Challenge · Solution · Result — each is its own grid row so the
                    three titles line up across both cards (CSS subgrid on lg+). */}
                {blocks.map(({ key, label, icon: Icon, color: c }, bi) => {
                  const text = tr[key as keyof typeof tr];
                  return (
                    <div
                      key={key}
                      className={`px-8 flex gap-3 bg-white dark:bg-white/5 ${bi === 0 ? "pt-6" : "pt-5"} ${bi === blocks.length - 1 ? "pb-8" : ""}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${c}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: c }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: c }}>
                          {label}
                        </div>
                        <p className="text-[#475569] dark:text-white/60 text-sm leading-relaxed text-justify">{parseRichText(text as string)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
