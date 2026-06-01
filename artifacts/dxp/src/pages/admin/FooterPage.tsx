import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";

export function FooterPage() {
  const { t } = useTranslation();
  const { footer, setFooter } = useAdminStore();
  const { lang } = useAdminLang();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async () => {
    setSaving(true);
    await downloadJson("footer.json", footer);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="footer-page">
      <PageHeader
        title={t("admin.footer")}
        description="Edita el pie de página. Guarda para escribir footer.json."
        onSave={persist}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-4 max-w-lg">
        <LangToggle />

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <TextField
            label="Copyright"
            value={footer.copyright?.[lang] ?? ""}
            onChange={(v) => setFooter({ ...footer, copyright: { ...footer.copyright, [lang]: v } })}
          />

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Enlaces</label>
            <div className="space-y-2">
              {footer.links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <TextField
                    className="flex-1"
                    value={link.label[lang] ?? ""}
                    onChange={(v) =>
                      setFooter({
                        ...footer,
                        links: footer.links.map((l, j) => (j === i ? { ...l, label: { ...l.label, [lang]: v } } : l)),
                      })
                    }
                    placeholder={lang === "es" ? "Etiqueta" : "Label"}
                  />
                  <TextField
                    className="w-40"
                    type="url"
                    value={link.url}
                    onChange={(v) =>
                      setFooter({
                        ...footer,
                        links: footer.links.map((l, j) => (j === i ? { ...l, url: v } : l)),
                      })
                    }
                    placeholder="/privacy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
