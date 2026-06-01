import { useTranslation } from "react-i18next";
import { resolveIcon } from "@/lib/icons";
import { listActiveServices } from "@/services/services.service";

export function ServicesSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";
  const services = listActiveServices();

  const accentColors = [
    "#2563EB", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B",
  ];

  return (
    <section
      id="services"
      className="py-24 bg-[#F5F8FF] dark:bg-[#0F172A] relative overflow-hidden"
      data-testid="services-section"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-20 dark:opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2563EB]/25 dark:border-[#2563EB]/30 bg-[#2563EB]/8 dark:bg-[#2563EB]/10 text-[#2563EB] dark:text-[#06B6D4] text-xs font-semibold uppercase tracking-widest mb-4">
            {t("services.title")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
            {t("services.title")}
          </h2>
          <p className="text-[#64748B] dark:text-white/50 max-w-xl mx-auto">{t("services.subtitle")}</p>
        </div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const tr = service.translations[lang] ?? service.translations.es;
            const Icon = resolveIcon(service.iconName);
            const color = accentColors[idx % accentColors.length];

            return (
              <div
                key={service.id}
                className="group p-6 rounded-2xl border border-[#E2E8F0] bg-white hover:shadow-lg dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/7 dark:hover:border-white/15 transition-all duration-300"
                data-testid={`service-card-${service.id}`}
              >
                {/* Header row: icon · title — on one line */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white min-w-0 truncate">
                    {tr.name}
                  </h3>
                </div>

                <p className="text-[#64748B] dark:text-white/50 text-sm leading-relaxed">{tr.description}</p>

                {/* Bottom line */}
                <div
                  className="mt-5 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: `linear-gradient(to right, ${color}, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
