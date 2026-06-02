import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextField, Toggle, AdminCard } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { translatorSupported } from "@/lib/translate";
import { contactDeliveryEnabled } from "@/lib/contact";

const selectCls =
  "w-full h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary";

const CONTACT_PROVIDERS = ["none", "formsubmit", "web3forms", "formspree", "custom"] as const;

export function SettingsPage() {
  const { t } = useTranslation();
  const { settings, setSettings } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(settings));
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
    setSettings(draft);
    await downloadJson("settings.json", draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const provider = draft.contact.provider;

  return (
    <div data-testid="settings-page">
      <PageHeader
        title={t("admin.settings")}
        description="Configuración del sistema DXP."
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        <AdminCard title="General">
          <TextField
            label={t("admin.siteName")}
            value={draft.siteName}
            onChange={(v) => update((d) => { d.siteName = v; })}
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Modo de almacenamiento</h3>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-sm text-muted-foreground">JSON local (archivos en repositorio)</span>
            </div>
          </div>
        </AdminCard>

        <AdminCard title={t("admin.autoTranslate")}>
          <Toggle
            label={t("admin.autoTranslate")}
            checked={draft.autoTranslate.enabled}
            onChange={(v) => update((d) => { d.autoTranslate.enabled = v; })}
          />
          <p className="text-xs text-muted-foreground -mt-2">{t("admin.autoTranslateHint")}</p>
          <Toggle
            label="Auto-llenar al salir del campo"
            checked={draft.autoTranslate.fillEmptyOnBlur}
            onChange={(v) => update((d) => { d.autoTranslate.fillEmptyOnBlur = v; })}
          />
          {!translatorSupported() && (
            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-lg px-3 py-2">
              {t("admin.autoTranslateUnsupported")}
            </p>
          )}
        </AdminCard>

        <AdminCard title={t("admin.contactDelivery")}>
          <p className="text-xs text-muted-foreground">{t("admin.contactDeliveryHint")}</p>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("admin.contactProvider")}</label>
            <select
              value={provider}
              onChange={(e) => update((d) => { d.contact.provider = e.target.value; })}
              className={selectCls}
              data-testid="select-contact-provider"
            >
              {CONTACT_PROVIDERS.map((p) => (
                <option key={p} value={p}>{p === "none" ? "none (solo local)" : p}</option>
              ))}
            </select>
          </div>
          {provider === "web3forms" && (
            <TextField
              label={t("admin.contactKey")}
              value={draft.contact.accessKey}
              onChange={(v) => update((d) => { d.contact.accessKey = v; })}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          )}
          {(provider === "formsubmit" || provider === "formspree" || provider === "custom") && (
            <TextField
              label={t("admin.contactEndpoint")}
              value={draft.contact.endpoint}
              onChange={(v) => update((d) => { d.contact.endpoint = v; })}
              placeholder={
                provider === "formsubmit"
                  ? "tu@correo.com"
                  : provider === "formspree"
                    ? "xxxxxxx (form id) o URL completa"
                    : "https://tu-endpoint/submit"
              }
            />
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${contactDeliveryEnabled(draft.contact) ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`} />
            <span className="text-muted-foreground">
              {contactDeliveryEnabled(draft.contact)
                ? "Entrega activa — los mensajes se envían al proveedor."
                : "Entrega inactiva — los mensajes solo se guardan localmente."}
            </span>
          </div>
        </AdminCard>

        <AdminCard title="Acciones">
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="w-full px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors text-left"
            data-testid="btn-clear-storage"
          >
            Limpiar almacenamiento local
          </button>
        </AdminCard>
      </div>
    </div>
  );
}
