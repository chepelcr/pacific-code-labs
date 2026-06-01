import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Plus, Trash2, Link } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function MediaPage() {
  const { t } = useTranslation();
  const { mediaFiles, setThemes } = useAdminStore();
  const store = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ url: "", filename: "", altText: "" });

  const handleAdd = () => {
    if (!form.url || !form.filename) return;
    const newFile = {
      id: `media-${Date.now()}`,
      filename: form.filename,
      url: form.url,
      type: "image" as const,
      size: 0,
      altText: form.altText || undefined,
      createdAt: new Date().toISOString(),
    };
    store.setThemes(store.themes); // just to trigger re-render — we'll use the store method directly
    // Actually add to mediaFiles via zustand setter
    useAdminStore.setState((s) => ({ mediaFiles: [...s.mediaFiles, newFile] }));
    setForm({ url: "", filename: "", altText: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    useAdminStore.setState((s) => ({ mediaFiles: s.mediaFiles.filter((f) => f.id !== id) }));
  };

  return (
    <div data-testid="media-page">
      <PageHeader
        title={t("admin.media")}
        description="Gestiona imágenes y archivos del sitio."
        onExport={() => downloadJson("media.json", mediaFiles)}
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1d4ed8]"
            data-testid="btn-add-media"
          >
            <Plus className="w-4 h-4" />
            Agregar URL
          </button>
        }
      />

      {mediaFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] border-dashed p-16 text-center">
          <Image className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#94A3B8] font-medium">Biblioteca vacía</p>
          <p className="text-[#CBD5E1] text-sm mt-1">Agrega URLs de imágenes para organizarlas aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaFiles.map((f) => (
            <div key={f.id} className="group relative bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" data-testid={`media-item-${f.id}`}>
              <img src={f.url} alt={f.altText ?? f.filename} className="w-full aspect-square object-cover" />
              <div className="p-2">
                <p className="text-xs text-[#64748B] truncate">{f.filename}</p>
              </div>
              <button
                onClick={() => handleDelete(f.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#0F172A] mb-5">Agregar imagen por URL</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">URL de la imagen</label>
                <input value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" data-testid="input-media-url" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Nombre de archivo</label>
                <input value={form.filename} onChange={(e) => setForm({...form, filename: e.target.value})} placeholder="logo.png" className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Texto alternativo</label>
                <input value={form.altText} onChange={(e) => setForm({...form, altText: e.target.value})} placeholder="Descripción de la imagen" className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAdd} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8]" data-testid="btn-confirm-add-media">Agregar</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
