import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

const LANGS = ["es", "en"] as const;
const inputCls =
  "w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]";

export function HeroPage() {
  const { t } = useTranslation();
  const { hero, setHero } = useAdminStore();
  // Local draft so edits are batched until "Save".
  const [draft, setDraft] = useState(() => structuredClone(hero));

  const update = (mut: (d: typeof draft) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      mut(next);
      return next;
    });
  };

  return (
    <div data-testid="hero-page">
      <PageHeader
        title={t("admin.hero")}
        description="Edita la portada: eyebrow, título, subtítulo y estadísticas."
        onExport={() => downloadJson("hero.json", draft)}
        action={
          <button
            onClick={() => setHero(draft)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-colors"
            data-testid="btn-save-hero"
          >
            {t("admin.save")}
          </button>
        }
      />

      <div className="grid md:grid-cols-2 gap-6">
        {LANGS.map((lang) => {
          const tr = draft.translations[lang];
          return (
            <div key={lang} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#94A3B8]">
                {lang === "es" ? "Español" : "English"}
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Eyebrow</label>
                <input
                  value={tr.eyebrow}
                  onChange={(e) => update((d) => { d.translations[lang].eyebrow = e.target.value; })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Título</label>
                <textarea
                  value={tr.title}
                  onChange={(e) => update((d) => { d.translations[lang].title = e.target.value; })}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Subtítulo</label>
                <textarea
                  value={tr.subtitle}
                  onChange={(e) => update((d) => { d.translations[lang].subtitle = e.target.value; })}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-2">Estadísticas</label>
                <div className="space-y-2">
                  {tr.stats.map((stat, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={stat.value}
                        onChange={(e) => update((d) => { d.translations[lang].stats[i].value = e.target.value; })}
                        placeholder="2"
                        className={`${inputCls} w-20`}
                      />
                      <input
                        value={stat.label}
                        onChange={(e) => update((d) => { d.translations[lang].stats[i].label = e.target.value; })}
                        placeholder="Label"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
