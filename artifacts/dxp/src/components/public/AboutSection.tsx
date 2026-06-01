import { useTranslation } from "react-i18next";
import { MapPin, Users, Briefcase } from "lucide-react";

export function AboutSection() {
  const { t } = useTranslation();

  const stats = [
    { icon: MapPin, value: "2019", label: t("about.founded") },
    { icon: Users, value: "10+", label: t("about.clients") },
    { icon: Briefcase, value: "20+", label: t("about.projects") },
  ];

  return (
    <section
      id="about"
      className="py-24 bg-white"
      data-testid="about-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-widest mb-6">
              Pacific Code Labs
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-6 leading-tight">
              {t("about.title")}
            </h2>
            <p className="text-[#475569] leading-relaxed mb-8 text-lg">{t("about.body")}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center" data-testid={`about-stat-${s.value}`}>
                  <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-2">
                    <s.icon className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="text-xl font-bold text-[#0F172A]">{s.value}</div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-[#0F172A] p-8 border border-[#1e3a5f]">
              {/* SVG network decoration */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 400 300"
                fill="none"
                aria-hidden="true"
              >
                <g stroke="#2563EB" strokeWidth="0.8">
                  <line x1="50" y1="50" x2="200" y2="150" />
                  <line x1="200" y1="150" x2="350" y2="80" />
                  <line x1="200" y1="150" x2="180" y2="250" />
                  <line x1="50" y1="50" x2="100" y2="200" />
                  <line x1="350" y1="80" x2="300" y2="220" />
                  <line x1="100" y1="200" x2="180" y2="250" />
                  <line x1="180" y1="250" x2="300" y2="220" />
                </g>
                {[[50,50],[200,150],[350,80],[100,200],[180,250],[300,220]].map(([cx,cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="5" fill="#06B6D4" opacity="0.7" />
                ))}
              </svg>

              <div className="relative z-10 space-y-4">
                <div className="text-white font-semibold text-lg mb-6">
                  {t("about.values_title")}
                </div>
                {["Software Engineering", "Artificial Intelligence", "Business Automation", "Cloud Architecture", "Technical Support"].map((area, i) => (
                  <div key={area} className="flex items-center gap-3 text-white/70 text-sm">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: ["#2563EB","#06B6D4","#10B981","#8B5CF6","#F59E0B"][i] }}
                    />
                    {area}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-semibold text-[#0F172A]">
                  {t("about.founded")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
