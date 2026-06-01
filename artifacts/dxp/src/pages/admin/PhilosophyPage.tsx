import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { BilingualTextArea, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

const PILLARS = ["knowledge", "community", "growth"] as const;

export function PhilosophyPage() {
  const { t } = useTranslation();
  const { philosophy, setPhilosophy } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(philosophy));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (pillar: (typeof PILLARS)[number], lang: Lang, value: string) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      next[pillar][lang] = value;
      return next;
    });

  const save = async () => {
    setSaving(true);
    setPhilosophy(draft);
    await downloadJson("philosophy.json", draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="philosophy-page">
      <PageHeader
        title={t("admin.philosophy")}
        description="Edita el texto de los tres pilares. Los títulos se editan en Traducciones."
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        {PILLARS.map((pillar) => (
          <BilingualSection key={pillar} title={t(`philosophy.${pillar}_title`)}>
            <BilingualTextArea
              es={draft[pillar].es}
              en={draft[pillar].en}
              onChange={(l, v) => update(pillar, l, v)}
              rows={4}
              hint={RICH_TEXT_HINT}
            />
          </BilingualSection>
        ))}
      </div>
    </div>
  );
}
