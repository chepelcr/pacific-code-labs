import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { BilingualField, BilingualTextArea, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

export function AboutPage() {
  const { t } = useTranslation();
  const { about, setAbout } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(about));
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
    setAbout(draft);
    await downloadJson("about.json", draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const es = draft.translations.es;
  const en = draft.translations.en;

  return (
    <div data-testid="about-page">
      <PageHeader
        title={t("admin.about")}
        description="Edita la sección Nosotros: eyebrow, título, cuerpo, estadísticas y título de áreas. La lista de áreas refleja los Servicios activos."
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        <BilingualSection title="Contenido">
          <BilingualField label="Eyebrow" es={es.eyebrow} en={en.eyebrow} onChange={(l, v) => update((d) => { d.translations[l].eyebrow = v; })} />
          <BilingualField label="Título" es={es.title} en={en.title} onChange={(l, v) => update((d) => { d.translations[l].title = v; })} />
          <BilingualTextArea label="Cuerpo" es={es.body} en={en.body} onChange={(l, v) => update((d) => { d.translations[l].body = v; })} rows={4} hint={RICH_TEXT_HINT} />
          <BilingualField label="Título de áreas" es={es.valuesTitle} en={en.valuesTitle} onChange={(l, v) => update((d) => { d.translations[l].valuesTitle = v; })} />
        </BilingualSection>

        <BilingualSection title="Estadísticas">
          {es.stats.map((_, i) => (
            <div key={i} className="space-y-3 pb-3 border-b border-[#F1F5F9] last:border-0 last:pb-0">
              <BilingualField label={`Valor ${i + 1}`} es={es.stats[i].value} en={en.stats[i].value} onChange={(l, v) => update((d) => { d.translations[l].stats[i].value = v; })} placeholder="2019" />
              <BilingualField label={`Etiqueta ${i + 1}`} es={es.stats[i].label} en={en.stats[i].label} onChange={(l, v) => update((d) => { d.translations[l].stats[i].label = v; })} placeholder="Fundados en Costa Rica" />
            </div>
          ))}
        </BilingualSection>
      </div>
    </div>
  );
}
