import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextField, TextAreaField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

export function HeroPage() {
  const { t } = useTranslation();
  const { hero, setHero } = useAdminStore();
  const { lang } = useAdminLang();
  const [draft, setDraft] = useState(() => structuredClone(hero));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tr = draft.translations[lang];
  const update = (mut: (d: typeof draft) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      mut(next);
      return next;
    });

  const save = async () => {
    setSaving(true);
    setHero(draft);
    await downloadJson("hero.json", draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="hero-page">
      <PageHeader
        title={t("admin.hero")}
        description="Edita la portada: eyebrow, título, subtítulo y estadísticas."
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6 max-w-3xl">
        <LangToggle />

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <TextField label="Eyebrow" value={tr.eyebrow} onChange={(v) => update((d) => { d.translations[lang].eyebrow = v; })} />
          <TextAreaField
            label="Título"
            value={tr.title}
            onChange={(v) => update((d) => { d.translations[lang].title = v; })}
            rows={2}
            hint={RICH_TEXT_HINT}
          />
          <TextAreaField label="Subtítulo" value={tr.subtitle} onChange={(v) => update((d) => { d.translations[lang].subtitle = v; })} rows={2} />
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Estadísticas</label>
          <div className="space-y-2">
            {tr.stats.map((stat, i) => (
              <div key={i} className="flex gap-2">
                <TextField className="w-24" value={stat.value} onChange={(v) => update((d) => { d.translations[lang].stats[i].value = v; })} placeholder="2" />
                <TextField className="flex-1" value={stat.label} onChange={(v) => update((d) => { d.translations[lang].stats[i].label = v; })} placeholder="Etiqueta" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
