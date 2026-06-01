import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

const PILLARS = ["knowledge", "community", "growth"] as const;
const LANGS = ["es", "en"] as const;
const inputCls =
  "w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none";

export function PhilosophyPage() {
  const { t } = useTranslation();
  const { philosophy, setPhilosophy } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(philosophy));

  const update = (pillar: (typeof PILLARS)[number], lang: (typeof LANGS)[number], value: string) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next[pillar][lang] = value;
      return next;
    });
  };

  return (
    <div data-testid="philosophy-page">
      <PageHeader
        title={t("admin.philosophy")}
        description="Edita el texto de los tres pilares. Los títulos se editan en Idiomas/traducciones."
        onExport={() => downloadJson("philosophy.json", draft)}
        action={
          <button
            onClick={() => setPhilosophy(draft)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-colors"
            data-testid="btn-save-philosophy"
          >
            {t("admin.save")}
          </button>
        }
      />

      <div className="space-y-6">
        {PILLARS.map((pillar) => (
          <div key={pillar} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] mb-4">
              {t(`philosophy.${pillar}_title`)}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {LANGS.map((lang) => (
                <div key={lang}>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">
                    {lang === "es" ? "Texto (ES)" : "Text (EN)"}
                  </label>
                  <textarea
                    value={draft[pillar][lang]}
                    onChange={(e) => update(pillar, lang, e.target.value)}
                    rows={4}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
