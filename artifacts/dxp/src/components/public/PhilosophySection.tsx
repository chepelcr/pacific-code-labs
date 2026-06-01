import { useTranslation } from "react-i18next";
import { BookOpen, Users, Leaf } from "lucide-react";
import philosophyData from "@/content/philosophy.json";

export function PhilosophySection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";

  const pillars = [
    {
      key: "knowledge",
      icon: BookOpen,
      title: t("philosophy.knowledge_title"),
      text: philosophyData.knowledge[lang] ?? philosophyData.knowledge.es,
      color: "#2563EB",
      bg: "#2563EB",
    },
    {
      key: "community",
      icon: Users,
      title: t("philosophy.community_title"),
      text: philosophyData.community[lang] ?? philosophyData.community.es,
      color: "#06B6D4",
      bg: "#06B6D4",
    },
    {
      key: "growth",
      icon: Leaf,
      title: t("philosophy.growth_title"),
      text: philosophyData.growth[lang] ?? philosophyData.growth.es,
      color: "#10B981",
      bg: "#10B981",
    },
  ];

  return (
    <section
      id="philosophy"
      className="py-24 bg-[#F8FAFC] relative overflow-hidden"
      data-testid="philosophy-section"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg viewBox="0 0 100 100" className="absolute bottom-0 right-0 w-64 h-64 text-[#2563EB]/10" fill="currentColor">
          <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fillOpacity="0.3" />
          <polygon points="50,15 85,32 85,68 50,85 15,68 15,32" fillOpacity="0.15" />
          <polygon points="50,25 75,37 75,63 50,75 25,63 25,37" fillOpacity="0.08" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-widest mb-4">
            {t("philosophy.title")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
            {t("philosophy.title")}
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto">{t("philosophy.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={pillar.key}
              className="relative group rounded-2xl bg-white border border-[#E2E8F0] p-8 hover:shadow-lg transition-all duration-300 overflow-hidden"
              data-testid={`philosophy-pillar-${pillar.key}`}
            >
              {/* Number */}
              <div
                className="absolute top-6 right-6 text-6xl font-black opacity-5"
                style={{ color: pillar.color }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: `${pillar.bg}15` }}
              >
                <pillar.icon className="w-6 h-6" style={{ color: pillar.color }} />
              </div>

              <h3 className="text-xl font-bold text-[#0F172A] mb-3">{pillar.title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{pillar.text}</p>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
                style={{ background: `linear-gradient(to right, ${pillar.color}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
