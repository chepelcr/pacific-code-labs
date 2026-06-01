import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, CheckCircle } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export function ContactSection() {
  const { t } = useTranslation();
  const addMessage = useAdminStore((s) => s.addContactMessage);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", subject: "", message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    addMessage(form);
    setSent(true);
    setForm({ name: "", email: "", company: "", subject: "", message: "" });
  };

  return (
    <section
      id="contact"
      className="py-24 bg-[#0F172A] relative overflow-hidden"
      data-testid="contact-section"
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2563EB]/8 blur-3xl" />

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 text-[#06B6D4] text-xs font-semibold uppercase tracking-widest mb-4">
            {t("contact.title")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-white/50">{t("contact.subtitle")}</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-10 text-center">
            <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">{t("contact.success")}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white/4 border border-white/8 rounded-2xl p-8"
            data-testid="contact-form"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">
                  {t("contact.name")} <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t("contact.placeholder_name")}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:bg-white/8 transition-colors"
                  data-testid="input-name"
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">
                  {t("contact.email")} <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t("contact.placeholder_email")}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:bg-white/8 transition-colors"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                {t("contact.company")}
              </label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder={t("contact.placeholder_company")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:bg-white/8 transition-colors"
                data-testid="input-company"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                {t("contact.subject")}
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder={t("contact.placeholder_subject")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:bg-white/8 transition-colors"
                data-testid="input-subject"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">
                {t("contact.message")} <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t("contact.placeholder_message")}
                rows={5}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:bg-white/8 transition-colors resize-none"
                data-testid="input-message"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white font-semibold text-sm hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all shadow-lg shadow-[#2563EB]/25"
              data-testid="button-submit"
            >
              <Send className="w-4 h-4" />
              {t("contact.send")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
