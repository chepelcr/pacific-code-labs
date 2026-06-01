import { useTranslation } from "react-i18next";
import { Mail, Clock, CheckCircle, Archive } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function ContactPage() {
  const { t } = useTranslation();
  const { contactMessages, updateContactMessage } = useAdminStore();

  const statusIcon = {
    new: <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />,
    read: <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />,
    archived: <Archive className="w-3.5 h-3.5 text-[#94A3B8]" />,
  };

  return (
    <div data-testid="contact-page">
      <PageHeader
        title={t("admin.contact")}
        description={`${contactMessages.filter((m) => m.status === "new").length} mensajes nuevos`}
        onExport={() => downloadJson("contact-messages.json", contactMessages)}
      />

      {contactMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
          <Mail className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#94A3B8] text-sm">No hay mensajes aún.</p>
          <p className="text-[#CBD5E1] text-xs mt-1">Los mensajes del formulario de contacto aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contactMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border p-5 ${
                msg.status === "new" ? "border-[#2563EB]/30" : "border-[#E2E8F0]"
              }`}
              data-testid={`message-card-${msg.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {msg.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0F172A] text-sm">{msg.name}</span>
                      <div className="flex items-center gap-1">{statusIcon[msg.status]}</div>
                    </div>
                    <div className="text-xs text-[#94A3B8]">{msg.email}</div>
                    {msg.company && <div className="text-xs text-[#94A3B8]">{msg.company}</div>}
                    {msg.subject && <div className="text-sm font-medium text-[#475569] mt-1">{msg.subject}</div>}
                    <p className="text-sm text-[#64748B] mt-2">{msg.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                  <select
                    value={msg.status}
                    onChange={(e) => updateContactMessage(msg.id, { status: e.target.value as "new" | "read" | "archived" })}
                    className="text-xs px-2 py-1 rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#2563EB]"
                    data-testid={`msg-status-${msg.id}`}
                  >
                    <option value="new">Nuevo</option>
                    <option value="read">Leído</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
