import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextAreaField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

const PILLARS = ["knowledge", "community", "growth"] as const;

export function PhilosophyPage() {
  const { t } = useTranslation();
  const { philosophy, setPhilosophy } = useAdminStore();
  const { lang } = useAdminLang();
  const [draft, setDraft] = useState(() => structuredClone(philosophy));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (pillar: (typeof PILLARS)[number], value: string) =>
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

      <div className="space-y-6 max-w-3xl">
        <LangToggle />
        {PILLARS.map((pillar) => (
          <div key={pillar} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] mb-3">
              {t(`philosophy.${pillar}_title`)}
            </h2>
            <TextAreaField
              value={draft[pillar][lang]}
              onChange={(v) => update(pillar, v)}
              rows={4}
              hint={RICH_TEXT_HINT}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
