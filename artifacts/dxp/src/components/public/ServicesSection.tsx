import { useTranslation } from "react-i18next";
import { Code2, BrainCircuit, Workflow, Cloud, Headphones } from "lucide-react";
import { listActiveServices } from "@/services/services.service";

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code2,
  BrainCircuit,
  Workflow,
  Cloud,
  Headphones,
};

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
      className="py-24 bg-[#0F172A] relative overflow-hidden"
      data-testid="services-section"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 text-[#06B6D4] text-xs font-semibold uppercase tracking-widest mb-4">
            {t("services.title")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("services.title")}
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">{t("services.subtitle")}</p>
        </div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const tr = service.translations[lang] ?? service.translations.es;
            const Icon = ICONS[service.iconName ?? "Code2"] ?? Code2;
            const color = accentColors[idx % accentColors.length];

            return (
              <div
                key={service.id}
                className="group p-6 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15 transition-all duration-300"
                data-testid={`service-card-${service.id}`}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>

                {/* Index */}
                <div
                  className="text-xs font-bold mb-2 font-mono"
                  style={{ color: `${color}80` }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{tr.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{tr.description}</p>

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
