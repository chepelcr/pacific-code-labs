import { Download } from "lucide-react";
import { FloatingSaveButton } from "./AdminUI";

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
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors"
            data-testid="btn-export"
          >
            <Download className="w-4 h-4" />
            {exportLabel}
          </button>
        )}
      </div>
      {/* Save travels with the user (fixed) instead of scrolling away in the header. */}
      {onSave && <FloatingSaveButton onClick={onSave} saving={saving} saved={saved} label={saveLabel} />}
    </div>
  );
}
