import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { BilingualField, BilingualTextArea, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

export function HeroPage() {
  const { t } = useTranslation();
  const { hero, setHero } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(hero));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        entity="hero.json"
        value={draft}
      />

      <div className="space-y-6">
        <BilingualSection>
          <BilingualField label="Eyebrow" es={draft.translations.es.eyebrow} en={draft.translations.en.eyebrow} onChange={(l, v) => update((d) => { d.translations[l].eyebrow = v; })} />
          <BilingualTextArea label="Título" es={draft.translations.es.title} en={draft.translations.en.title} onChange={(l, v) => update((d) => { d.translations[l].title = v; })} rows={2} hint={RICH_TEXT_HINT} />
          <BilingualTextArea label="Subtítulo" es={draft.translations.es.subtitle} en={draft.translations.en.subtitle} onChange={(l, v) => update((d) => { d.translations[l].subtitle = v; })} rows={2} />
        </BilingualSection>

        <BilingualSection title="Estadísticas">
          {draft.translations.es.stats.map((_, i) => (
            <div key={i} className="space-y-3 pb-3 border-b border-border last:border-0 last:pb-0">
              <BilingualField label={`Valor ${i + 1}`} es={draft.translations.es.stats[i].value} en={draft.translations.en.stats[i].value} onChange={(l, v) => update((d) => { d.translations[l].stats[i].value = v; })} placeholder="2" />
              <BilingualField label={`Etiqueta ${i + 1}`} es={draft.translations.es.stats[i].label} en={draft.translations.en.stats[i].label} onChange={(l, v) => update((d) => { d.translations[l].stats[i].label = v; })} placeholder="Etiqueta" />
            </div>
          ))}
        </BilingualSection>
      </div>
    </div>
  );
}
