import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { uploadAsset } from "@/lib/local-cms";

interface BrandAsset {
  label: string;
  description: string;
  storageKey: string;
  currentUrl: string;
  recommended: string;
  usage: string[];
}

const ASSETS: BrandAsset[] = [
  {
    label: "Logo (fondo transparente)",
    description: "Usado en navbar, sidebar y footer. Fondo transparente recomendado (PNG).",
    storageKey: "pcl-logo-url",
    currentUrl: "/logo.png",
    recommended: "400×400 px · PNG con fondo transparente",
    usage: ["Navbar pública", "Sidebar admin", "Footer", "OG image"],
  },
  {
    label: "Favicon",
    description: "Ícono que aparece en la pestaña del navegador. Se actualiza al recargar la página.",
    storageKey: "pcl-favicon-url",
    currentUrl: "/logo.png",
    recommended: "64×64 px · PNG o SVG",
    usage: ["Pestaña del navegador", "Marcadores", "Pantalla de inicio móvil"],
  },
];

function AssetCard({ asset }: { asset: BrandAsset }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? (localStorage.getItem(asset.storageKey) || asset.currentUrl);

  function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan archivos de imagen (PNG, SVG, WebP, JPG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo excede 2 MB. Por favor comprime la imagen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSave() {
    if (!preview) return;
    localStorage.setItem(asset.storageKey, preview);
    setSaved(true);
    // In local dev, write the image into public/ so it's committed with the repo.
    const targetFile = asset.currentUrl.replace(/^\//, "");
    void uploadAsset(targetFile, preview);
    // Apply favicon live
    if (asset.storageKey === "pcl-favicon-url") {
      const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (link) link.href = preview;
    }
  }

  function handleReset() {
    localStorage.removeItem(asset.storageKey);
    setPreview(null);
    setSaved(false);
    setError(null);
    if (asset.storageKey === "pcl-favicon-url") {
      const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (link) link.href = asset.currentUrl;
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-foreground">{asset.label}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{asset.description}</p>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-6">
        {/* Preview */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-xl border-2 border-border bg-background flex items-center justify-center overflow-hidden">
            {displayUrl ? (
              <img src={displayUrl} alt="preview" className="w-full h-full object-contain p-2" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{asset.recommended}</span>
        </div>

        {/* Upload zone + info */}
        <div className="flex-1 space-y-3">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-5 text-center transition-all ${
              dragging
                ? "border-primary bg-primary/10"
                : "border-input hover:border-primary hover:bg-primary/10"
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra una imagen o{" "}
              <span className="text-primary font-medium">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">PNG · SVG · WebP · JPG · máx 2 MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-950/60 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {saved && !error && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-100 dark:bg-emerald-950/60 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Guardado en el navegador. Se aplicará al recargar la página.
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!preview}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar original
            </button>
          </div>

          {/* Usage tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {asset.usage.map((u) => (
              <span key={u} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandingPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.branding")}
        description="Personaliza el logo y favicon de Pacific Code Labs."
      />

      <div className="bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Los cambios se guardan en el navegador local. Para hacerlos permanentes, reemplaza{" "}
          <code className="font-mono bg-amber-100 dark:bg-amber-950/50 px-1 rounded">public/logo.png</code> en el repositorio
          y despliega de nuevo.
        </span>
      </div>

      <div className="space-y-4">
        {ASSETS.map((asset) => (
          <AssetCard key={asset.storageKey} asset={asset} />
        ))}
      </div>

      {/* Live preview strip */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Vista previa en contexto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Navbar preview */}
          <div className="rounded-lg bg-[#0F172A] p-3 flex items-center gap-2">
            <img
              src={localStorage.getItem("pcl-logo-url") || "/logo.png"}
              alt="logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-white text-xs font-semibold">Pacific Code Labs</span>
          </div>
          {/* Sidebar preview */}
          <div className="rounded-lg bg-[#0F172A] p-3 flex items-center gap-2">
            <img
              src={localStorage.getItem("pcl-logo-url") || "/logo.png"}
              alt="logo"
              className="w-6 h-6 object-contain"
            />
            <span className="text-white text-xs font-semibold">Admin Panel</span>
          </div>
          {/* Footer preview */}
          <div className="rounded-lg bg-[#0F172A] p-3 flex items-center gap-2">
            <img
              src={localStorage.getItem("pcl-logo-url") || "/logo.png"}
              alt="logo"
              className="w-6 h-6 object-contain"
            />
            <span className="text-white/50 text-xs">© 2025 Pacific Code Labs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
