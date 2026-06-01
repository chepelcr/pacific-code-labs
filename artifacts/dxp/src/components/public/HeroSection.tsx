import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import heroData from "@/content/hero.json";

export function HeroSection() {
  const { i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";
  const content = heroData.translations[lang] ?? heroData.translations.es;
  const { t } = useTranslation();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#EEF2FF] dark:bg-[#0F172A]"
      data-testid="hero-section"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-pattern opacity-40 dark:opacity-100" />

      {/* Radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#2563EB]/8 dark:bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[#06B6D4]/6 dark:bg-[#06B6D4]/8 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-[#10B981]/4 dark:bg-[#10B981]/6 blur-3xl" />
      </div>

      {/* Geometric SVG network */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 dark:opacity-10"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g stroke="#2563EB" strokeWidth="0.5">
          <line x1="100" y1="200" x2="350" y2="400" />
          <line x1="350" y1="400" x2="600" y2="250" />
          <line x1="600" y1="250" x2="850" y2="420" />
          <line x1="850" y1="420" x2="1100" y2="200" />
          <line x1="200" y1="600" x2="450" y2="450" />
          <line x1="450" y1="450" x2="700" y2="580" />
          <line x1="700" y1="580" x2="950" y2="380" />
          <line x1="350" y1="400" x2="450" y2="450" />
          <line x1="600" y1="250" x2="700" y2="580" />
          <line x1="850" y1="420" x2="950" y2="380" />
        </g>
        <g stroke="#06B6D4" strokeWidth="0.5">
          <line x1="50" y1="400" x2="200" y2="600" />
          <line x1="1100" y1="200" x2="1150" y2="500" />
          <line x1="1150" y1="500" x2="950" y2="380" />
          <line x1="100" y1="200" x2="200" y2="600" />
        </g>
        {[
          [100, 200], [350, 400], [600, 250], [850, 420],
          [1100, 200], [200, 600], [450, 450], [700, 580], [950, 380],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#2563EB" opacity="0.6" />
        ))}
        {[[50, 400], [1150, 500]].map(([cx, cy], i) => (
          <circle key={`c${i}`} cx={cx} cy={cy} r="3" fill="#06B6D4" opacity="0.5" />
        ))}
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2563EB]/25 dark:border-[#2563EB]/30 bg-[#2563EB]/8 dark:bg-[#2563EB]/10 text-[#2563EB] dark:text-[#06B6D4] text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          {content.eyebrow}
        </div>

        {/* Heading */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] dark:text-white leading-tight tracking-tight mb-6"
          data-testid="hero-title"
        >
          {content.title.split(" ").slice(0, 4).join(" ")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]">
            {content.title.split(" ").slice(4).join(" ")}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl text-[#475569] dark:text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          data-testid="hero-subtitle"
        >
          {content.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white font-semibold text-sm hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all shadow-lg shadow-[#2563EB]/25"
            data-testid="hero-cta-primary"
          >
            {t("hero.cta_primary")}
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3.5 rounded-xl border border-[#0F172A]/20 dark:border-white/15 text-[#0F172A] dark:text-white/80 font-semibold text-sm hover:bg-[#0F172A]/5 dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white transition-all"
            data-testid="hero-cta-secondary"
          >
            {t("hero.cta_secondary")}
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-[#0F172A]/10 dark:border-white/10 pt-10">
          {content.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[#0F172A] dark:text-white">{stat.value}</div>
              <div className="text-xs text-[#94A3B8] dark:text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#94A3B8] dark:text-white/30">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#94A3B8] dark:to-white/30" />
        <svg className="w-4 h-4 animate-bounce" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
