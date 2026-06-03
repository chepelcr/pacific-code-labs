import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Film, Music, Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import {
  uploadToLibrary,
  addExternalToLibrary,
  removeFromLibrary,
} from "@/lib/media-upload";
import { resolveMediaUrl, type MediaItem, type MediaKind } from "@/lib/media";

function KindIcon({ kind, className }: { kind: MediaKind; className?: string }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "audio") return <Music className={className} />;
  return <ImageIcon className={className} />;
}

function Thumb({ item }: { item: MediaItem }) {
  const url = resolveMediaUrl(item);
  if (item.kind === "image") return <img src={url} alt={item.alt?.es ?? item.filename} className="w-full aspect-square object-cover" />;
  if (item.kind === "video") return <video src={url} className="w-full aspect-square object-cover" muted />;
  return (
    <div className="w-full aspect-square flex items-center justify-center bg-muted">
      <Music className="w-8 h-8 text-muted-foreground" />
    </div>
  );
}

export function MediaPage() {
  const { t } = useTranslation();
  const media = useAdminStore((s) => s.media);
  const setMedia = useAdminStore((s) => s.setMedia);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlForm, setUrlForm] = useState<{ url: string; kind: MediaKind }>({ url: "", kind: "image" });

  async function handleFiles(files: FileList) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) await uploadToLibrary(file);
    } finally {
      setBusy(false);
    }
  }

  async function addUrl() {
    if (!urlForm.url.trim()) return;
    await addExternalToLibrary(urlForm.url.trim(), urlForm.kind);
    setUrlForm({ url: "", kind: "image" });
    setShowUrl(false);
  }

  function updateAlt(id: string, lang: "es" | "en", value: string) {
    setMedia({
      items: media.items.map((i) =>
        i.id === id ? { ...i, alt: { es: i.alt?.es ?? "", en: i.alt?.en ?? "", [lang]: value } } : i,
      ),
    });
  }

  const persist = async () => {
    setSaving(true);
    await downloadJson("media.json", media);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="media-page">
      <PageHeader
        title={t("admin.media.title", "Media")}
        description={t("admin.media.subtitle", "Upload images, video and audio, or link external media.")}
        entity="media.json"
        value={media}
        onSave={persist}
        saving={saving}
        saved={saved}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
              data-testid="btn-upload-media"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {t("admin.media.upload", "Upload")}
            </button>
            <button
              onClick={() => setShowUrl(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium"
              data-testid="btn-add-media-url"
            >
              <Plus className="w-4 h-4" />
              {t("admin.media.addUrl", "Add URL")}
            </button>
          </div>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {media.items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border border-dashed p-16 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{t("admin.media.empty", "Library empty")}</p>
          <p className="text-muted-foreground text-sm mt-1">
            {t("admin.media.emptyHint", "Upload media from your computer or add an external URL.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.items.map((item) => (
            <div key={item.id} className="group relative bg-card rounded-xl border border-border overflow-hidden" data-testid={`media-item-${item.id}`}>
              <Thumb item={item} />
              <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                <KindIcon kind={item.kind} className="w-3 h-3" />
                {item.source === "external" ? t("admin.media.external", "URL") : t("admin.media.local", "Local")}
              </span>
              <div className="p-2 space-y-1.5">
                <p className="text-xs text-muted-foreground truncate" title={item.filename}>{item.filename}</p>
                <input
                  value={item.alt?.es ?? ""}
                  onChange={(e) => updateAlt(item.id, "es", e.target.value)}
                  placeholder={t("admin.media.altEs", "Alt (ES)")}
                  className="w-full h-7 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:border-primary"
                />
                <input
                  value={item.alt?.en ?? ""}
                  onChange={(e) => updateAlt(item.id, "en", e.target.value)}
                  placeholder={t("admin.media.altEn", "Alt (EN)")}
                  className="w-full h-7 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => void removeFromLibrary(item.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                data-testid={`btn-delete-media-${item.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">{t("admin.media.addUrlTitle", "Add external media")}</h2>
              <button onClick={() => setShowUrl(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">URL</label>
                <input
                  value={urlForm.url}
                  onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                  placeholder="https://…"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm font-mono focus:outline-none focus:border-primary"
                  data-testid="input-media-url"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("admin.media.kind", "Type")}</label>
                <select
                  value={urlForm.kind}
                  onChange={(e) => setUrlForm({ ...urlForm, kind: e.target.value as MediaKind })}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none focus:border-primary"
                >
                  <option value="image">{t("admin.media.image", "Image")}</option>
                  <option value="video">{t("admin.media.video", "Video")}</option>
                  <option value="audio">{t("admin.media.audio", "Audio")}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addUrl} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90" data-testid="btn-confirm-add-media">
                {t("admin.media.add", "Add")}
              </button>
              <button onClick={() => setShowUrl(false)} className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm">
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
