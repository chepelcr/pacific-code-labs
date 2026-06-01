import { Save, Check } from "lucide-react";
import { useAdminLang } from "@/lib/admin-lang";

/**
 * Shared admin form primitives — the common building blocks every content page
 * uses, mirroring the pos-landing dashboard kit (LangToggle, TextField,
 * TextAreaField, Toggle, SaveButton) so the dashboard looks and behaves
 * consistently. Styled in the Pacific Code Labs admin palette.
 */

const inputCls =
  "w-full h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5";

/** Segmented ES/EN toggle bound to the shared admin editing language. */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useAdminLang();
  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 ${className}`}
      data-testid="admin-lang-toggle"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
        Idioma de edición
      </span>
      <div className="flex gap-1.5">
        {(["es", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`h-8 px-3 rounded-lg text-sm font-semibold transition-colors ${
              lang === l
                ? "bg-[#2563EB] text-white"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
            }`}
            data-testid={`admin-lang-${l}`}
          >
            {l === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
          </button>
        ))}
      </div>
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
      {hint && <p className="mt-1 text-xs text-[#94A3B8]">{hint}</p>}
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
      {hint && <p className="mt-1 text-xs text-[#94A3B8]">{hint}</p>}
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
          checked ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && <span className="text-sm font-medium text-[#0F172A]">{label}</span>}
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
      className="h-9 px-4 rounded-lg bg-[#2563EB] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[#1d4ed8] disabled:opacity-60 transition-colors"
      data-testid="btn-save"
    >
      {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saving ? "Guardando…" : saved ? "Guardado ✓" : label}
    </button>
  );
}
