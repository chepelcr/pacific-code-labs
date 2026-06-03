import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus, Trash2, Palette } from "lucide-react";
import {
  AdminCard,
  BilingualField,
  BilingualSection,
  FloatingSaveButton,
  TextField,
} from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAdminStore, downloadJson, useEntityDirty } from "@/lib/admin-store";
import { useAdminUi } from "@/lib/admin-ui";
import { applyBrandTheme, applyFavicon } from "@/lib/brand-theme";

type Themes = ReturnType<typeof useAdminStore.getState>["themes"];
type ColorKey = keyof Themes[number]["colors"];

const COLOR_KEYS: { key: ColorKey; labelKey: string; fallback: string }[] = [
  { key: "primary", labelKey: "admin.identity.colorPrimary", fallback: "Primary" },
  { key: "accent", labelKey: "admin.identity.colorAccent", fallback: "Accent" },
  { key: "emerald", labelKey: "admin.identity.colorEmerald", fallback: "Emerald" },
  { key: "navy", labelKey: "admin.identity.colorNavy", fallback: "Navy" },
  { key: "background", labelKey: "admin.identity.colorBackground", fallback: "Background" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-9 rounded-lg border border-input bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

export function BrandingPage() {
  const { t } = useTranslation();
  const { branding, setBranding, themes, setThemes } = useAdminStore();

  const [bDraft, setBDraft] = useState(() => structuredClone(branding));
  const [tDraft, setTDraft] = useState(() => structuredClone(themes));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const bDirty = useEntityDirty("branding.json", bDraft);
  const tDirty = useEntityDirty("themes.json", tDraft);
  const dirty = bDirty || tDirty;

  const setEditor = useAdminUi((s) => s.setEditor);
  const clearEditor = useAdminUi((s) => s.clearEditor);

  const updateBranding = (mut: (d: typeof bDraft) => void) =>
    setBDraft((prev) => {
      const next = structuredClone(prev);
      mut(next);
      return next;
    });

  // Mutate the theme draft and re-apply the active theme so the preview is live.
  const updateThemes = (mut: (d: typeof tDraft) => void) =>
    setTDraft((prev) => {
      const next = structuredClone(prev);
      mut(next);
      applyBrandTheme(next.find((th) => th.isActive) ?? next[0]);
      return next;
    });

  const save = useCallback(async () => {
    setSaving(true);
    setBranding(bDraft);
    setThemes(tDraft);
    await downloadJson("branding.json", bDraft);
    await downloadJson("themes.json", tDraft);
    applyFavicon(bDraft.faviconUrl);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [bDraft, tDraft, setBranding, setThemes]);

  // Register with the admin shell so the unsaved-changes nav guard covers this
  // two-file page. On unmount, re-apply the *saved* active theme so a discarded
  // edit doesn't leave stale colours applied.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    setEditor({ dirty, filename: "branding.json", save: async () => { await saveRef.current(); } });
    return () => {
      clearEditor();
      const stored = useAdminStore.getState().themes;
      applyBrandTheme(stored.find((th) => th.isActive) ?? stored[0]);
    };
  }, [dirty, setEditor, clearEditor]);

  const activeTheme = tDraft.find((th) => th.isActive) ?? tDraft[0];

  return (
    <div className="space-y-6" data-testid="identity-page">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.identity.title", "Site Identity")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("admin.identity.subtitle", "Logo, favicon, name and brand colours — all editable and published with the site.")}
          </p>
        </div>
      </div>

      {/* Brand assets */}
      <AdminCard title={t("admin.identity.assets", "Brand assets")}>
        <MediaPicker
          label={t("admin.identity.logo", "Logo")}
          hint={t("admin.identity.logoHint", "Used in the navbar, footer and admin. Transparent PNG/SVG recommended.")}
          value={bDraft.logoUrl}
          onChange={(v) => updateBranding((d) => { d.logoUrl = v; })}
        />
        <MediaPicker
          label={t("admin.identity.logoDark", "Logo (dark backgrounds)")}
          value={bDraft.logoUrlDark}
          onChange={(v) => updateBranding((d) => { d.logoUrlDark = v; })}
        />
        <MediaPicker
          label={t("admin.identity.favicon", "Favicon")}
          hint={t("admin.identity.faviconHint", "Browser tab icon. Applied after save / reload.")}
          value={bDraft.faviconUrl}
          onChange={(v) => updateBranding((d) => { d.faviconUrl = v; })}
        />
      </AdminCard>

      {/* Name + tagline */}
      <BilingualSection title={t("admin.identity.brand", "Brand")}>
        <TextField
          label={t("admin.identity.companyName", "Company name")}
          value={bDraft.companyName}
          onChange={(v) => updateBranding((d) => { d.companyName = v; })}
        />
        <BilingualField
          label={t("admin.identity.tagline", "Tagline")}
          es={bDraft.tagline.es}
          en={bDraft.tagline.en}
          onChange={(lang, v) => updateBranding((d) => { d.tagline[lang] = v; })}
        />
      </BilingualSection>

      {/* Theme */}
      <AdminCard
        title={t("admin.identity.theme", "Theme")}
        action={
          <button
            type="button"
            onClick={() =>
              updateThemes((d) => {
                const base = d.find((th) => th.isActive) ?? d[0];
                d.push({
                  ...structuredClone(base),
                  id: `theme-${Date.now()}`,
                  name: `${base.name} copy`,
                  isActive: false,
                  createdAt: new Date().toISOString(),
                });
              })
            }
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("admin.identity.addTheme", "Add theme")}
          </button>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {tDraft.map((theme, idx) => (
            <div
              key={theme.id}
              className={`rounded-2xl border-2 p-4 transition-all ${theme.isActive ? "border-primary shadow-sm" : "border-border"}`}
              data-testid={`theme-card-${theme.id}`}
            >
              <div className="flex items-center justify-between mb-3">
                <input
                  value={theme.name}
                  onChange={(e) => updateThemes((d) => { d[idx].name = e.target.value; })}
                  className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-foreground"
                />
                <div className="flex items-center gap-2">
                  {theme.isActive ? (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Check className="w-3 h-3" />
                      {t("admin.identity.active", "Active")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateThemes((d) => d.forEach((th) => { th.isActive = th.id === theme.id; }))}
                      className="text-xs px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      data-testid={`activate-theme-${theme.id}`}
                    >
                      {t("admin.identity.activate", "Activate")}
                    </button>
                  )}
                  {tDraft.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateThemes((d) => {
                          const wasActive = d[idx].isActive;
                          d.splice(idx, 1);
                          if (wasActive && d.length) d[0].isActive = true;
                        })
                      }
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title={t("admin.identity.deleteTheme", "Delete theme")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {COLOR_KEYS.map(({ key, labelKey, fallback }) => (
                  <ColorField
                    key={key}
                    label={t(labelKey, fallback)}
                    value={theme.colors[key]}
                    onChange={(v) => updateThemes((d) => { d[idx].colors[key] = v; })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <Palette className="w-3.5 h-3.5" />
          {t("admin.identity.themeHint", "The active theme's colours drive the live site. Changes preview instantly.")}
          {activeTheme ? ` · ${activeTheme.name}` : ""}
        </p>
      </AdminCard>

      {(dirty || saving || saved) && (
        <FloatingSaveButton onClick={save} saving={saving} saved={saved} label={t("admin.save", "Save")} />
      )}
    </div>
  );
}
