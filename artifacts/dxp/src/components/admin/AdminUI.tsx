import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Save, Check, Languages, ArrowLeftRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateText, type Lang } from "@/lib/translate";
import { useAutoTranslate } from "@/lib/use-auto-translate";

/**
 * Shared admin form primitives — the common building blocks every content page
 * uses (TextField, TextAreaField, Toggle, SaveButton) plus the bilingual editing
 * kit (BilingualField/BilingualTextArea/BilingualSection) that shows Spanish and
 * English side by side and can auto-fill the empty side via the on-device
 * Translator API. Styled in the Pacific Code Labs admin palette.
 */

const inputCls =
  "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors";
const labelCls =
  "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

/**
 * Full-width white card with an Eye/EyeOff toggle to collapse its body. `action`
 * renders inline in the header (left of the eye). Used everywhere in admin so
 * sections fill the container and can be folded away.
 */
export function AdminCard({
  title,
  action,
  children,
  className = "",
  bodyClassName = "p-6 space-y-4",
  defaultOpen = true,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-card rounded-2xl border border-border ${className}`} data-testid="admin-card">
      <div
        className={`flex items-center justify-between gap-3 px-6 py-3.5 transition-[border-color] duration-300 ${
          open ? "border-b border-border" : "border-b border-transparent"
        }`}
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2 ml-auto">
          {action}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-muted-foreground hover:text-primary transition-colors"
            title={open ? "Colapsar" : "Expandir"}
            aria-expanded={open}
            data-testid="admin-card-toggle"
          >
            {open ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {/* grid-rows 1fr→0fr animates height with no JS measuring; inner clips. */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={bodyClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// --- Bilingual section: collects its fields' "translate the empty side" actions
// so a single button can fill every blank target from its filled source. ---
type TranslateFn = (source: Lang, target: Lang) => Promise<void>;
interface SectionCtx {
  register: (id: string, fn: TranslateFn) => void;
  unregister: (id: string) => void;
}
const BilingualSectionContext = createContext<SectionCtx | null>(null);

export function BilingualSection({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const { enabled } = useAutoTranslate();
  const fns = useRef(new Map<string, TranslateFn>());
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<Lang>("es");
  const target: Lang = source === "es" ? "en" : "es";

  const ctx = useMemo<SectionCtx>(
    () => ({
      register: (id, fn) => fns.current.set(id, fn),
      unregister: (id) => fns.current.delete(id),
    }),
    [],
  );

  const run = async () => {
    setBusy(true);
    for (const fn of fns.current.values()) {
      // sequential: model handles one request at a time most reliably
      await fn(source, target);
    }
    setBusy(false);
  };

  const translateAction = enabled ? (
    <>
      <button
        type="button"
        onClick={() => setSource(target)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-secondary transition-colors"
        title={t("admin.autoTranslate")}
        data-testid="bilingual-direction"
      >
        <span>{source.toUpperCase()}</span>
        <ArrowLeftRight className="w-3 h-3" />
        <span>{target.toUpperCase()}</span>
      </button>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        data-testid="bilingual-translate"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
        {busy ? t("admin.autoTranslating") : t("admin.autoTranslateSection")}
      </button>
    </>
  ) : undefined;

  return (
    <BilingualSectionContext.Provider value={ctx}>
      <div data-testid="bilingual-section" className={className}>
        <AdminCard title={title} action={translateAction}>
          {children}
        </AdminCard>
      </div>
    </BilingualSectionContext.Provider>
  );
}

/** One pair of ES/EN inputs for the same field, rendered side by side. */
function useBilingualField(
  es: string,
  en: string,
  onChange: (lang: Lang, value: string) => void,
) {
  const { enabled, fillEmptyOnBlur } = useAutoTranslate();
  const section = useContext(BilingualSectionContext);
  const id = useId();

  // Keep the latest values in a ref so the registered/section callbacks read live state.
  const values = useRef({ es, en });
  values.current = { es, en };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const translateEmpty = useCallback<TranslateFn>(async (source, tgt) => {
    const src = values.current[source];
    const dst = values.current[tgt];
    if (!src?.trim() || dst?.trim()) return; // only fill an empty target
    const out = await translateText(src, source, tgt);
    if (out) onChangeRef.current(tgt, out);
  }, []);

  useEffect(() => {
    if (!section) return;
    section.register(id, translateEmpty);
    return () => section.unregister(id);
  }, [section, id, translateEmpty]);

  const onBlur = (source: Lang) => async () => {
    if (!enabled || !fillEmptyOnBlur) return;
    await translateEmpty(source, source === "es" ? "en" : "es");
  };

  return { onBlur };
}

export function BilingualField({
  label,
  es,
  en,
  onChange,
  placeholder,
  hint,
  type = "text",
  className = "",
}: {
  label?: string;
  es: string;
  en: string;
  onChange: (lang: Lang, value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "email" | "url";
  className?: string;
}) {
  const { t } = useTranslation();
  const { onBlur } = useBilingualField(es, en, onChange);
  const extra = type === "url" || type === "email" ? "font-mono" : "";
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        {(["es", "en"] as const).map((l) => (
          <div key={l}>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {t(l === "es" ? "admin.spanish" : "admin.english")}
            </span>
            <input
              type={type}
              value={l === "es" ? es : en}
              onChange={(e) => onChange(l, e.target.value)}
              onBlur={onBlur(l)}
              placeholder={placeholder}
              className={`${inputCls} ${extra}`}
              data-testid={`bilingual-${l}`}
            />
          </div>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function BilingualTextArea({
  label,
  es,
  en,
  onChange,
  rows = 3,
  placeholder,
  hint,
  className = "",
}: {
  label?: string;
  es: string;
  en: string;
  onChange: (lang: Lang, value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const { onBlur } = useBilingualField(es, en, onChange);
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        {(["es", "en"] as const).map((l) => (
          <div key={l}>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {t(l === "es" ? "admin.spanish" : "admin.english")}
            </span>
            <textarea
              value={l === "es" ? es : en}
              onChange={(e) => onChange(l, e.target.value)}
              onBlur={onBlur(l)}
              rows={rows}
              placeholder={placeholder}
              className={`${inputCls} h-auto py-2 resize-y leading-relaxed`}
              data-testid={`bilingual-${l}`}
            />
          </div>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  required,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "email" | "url";
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelCls}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${type === "url" || type === "email" ? "font-mono" : ""}`}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} h-auto py-2 resize-y leading-relaxed`}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? "bg-primary" : "bg-input"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}

/** Primary save button with saving/saved feedback — used in every PageHeader. */
export function SaveButton({
  onClick,
  saving = false,
  saved = false,
  label = "Guardar",
}: {
  onClick: () => void;
  saving?: boolean;
  saved?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
      data-testid="btn-save"
    >
      {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saving ? "Guardando…" : saved ? "Guardado ✓" : label}
    </button>
  );
}

/**
 * Floating save button — fixed to the bottom-right so it travels with the user
 * while scrolling a long content page, instead of living only in the page
 * header. Same saving/saved feedback as SaveButton. Rendered by PageHeader
 * whenever a page provides an `onSave` handler.
 */
export function FloatingSaveButton({
  onClick,
  saving = false,
  saved = false,
  label = "Guardar",
}: {
  onClick: () => void;
  saving?: boolean;
  saved?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`fixed bottom-6 right-6 z-40 h-12 px-5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-70 ${
        saved
          ? "bg-emerald-600 text-white"
          : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl"
      }`}
      data-testid="btn-save-floating"
      title={label}
    >
      {saving ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : saved ? (
        <Check className="w-5 h-5" />
      ) : (
        <Save className="w-5 h-5" />
      )}
      <span>{saving ? "Guardando…" : saved ? "Guardado ✓" : label}</span>
    </button>
  );
}
