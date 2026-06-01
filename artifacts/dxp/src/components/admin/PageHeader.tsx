import { Download } from "lucide-react";
import { SaveButton } from "./AdminUI";

interface Props {
  title: string;
  description?: string;
  /** Standardized primary save (consistent top-right placement across pages). */
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  saveLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  onSave,
  saving,
  saved,
  saveLabel,
  onExport,
  exportLabel = "Export JSON",
  action,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8" data-testid="page-header">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
        {description && <p className="text-[#64748B] text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action}
        {onSave && <SaveButton onClick={onSave} saving={saving} saved={saved} label={saveLabel} />}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] text-sm font-medium transition-colors"
            data-testid="btn-export"
          >
            <Download className="w-4 h-4" />
            {exportLabel}
          </button>
        )}
      </div>
    </div>
  );
}
