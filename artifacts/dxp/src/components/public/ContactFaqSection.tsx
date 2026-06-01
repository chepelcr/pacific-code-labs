import { FaqSection } from "./FaqSection";
import { ContactSection } from "./ContactSection";

/**
 * FAQ + Contact combined into one section. On desktop they sit side by side
 * (questions left, contact form right); on mobile they stack with the
 * questions first. The section owns `id="contact"`, so the "Contact" nav link
 * (the only routed anchor here — FAQ has no route) scrolls to the top of this
 * block, landing on the questions first.
 */
export function ContactFaqSection() {
  return (
    <section
      id="contact"
      className="py-24 bg-[#EEF2FF] dark:bg-[#0F172A] relative overflow-hidden"
      data-testid="contact-faq-section"
    >
      <div className="absolute inset-0 grid-pattern opacity-20 dark:opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2563EB]/6 dark:bg-[#2563EB]/8 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <FaqSection embedded />
          <ContactSection embedded />
        </div>
      </div>
    </section>
  );
}
