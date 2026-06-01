import { create } from "zustand";
import heroData from "../content/hero.json";
import productsData from "../content/products.json";
import servicesData from "../content/services.json";
import caseStudiesData from "../content/caseStudies.json";
import faqData from "../content/faq.json";
import philosophyData from "../content/philosophy.json";
import languagesData from "../content/languages.json";
import navigationData from "../content/navigation.json";
import footerData from "../content/footer.json";
import seoData from "../content/seo.json";
import themesData from "../content/themes.json";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

interface AdminStore {
  hero: typeof heroData;
  products: typeof productsData;
  services: typeof servicesData;
  caseStudies: typeof caseStudiesData;
  faq: typeof faqData;
  philosophy: typeof philosophyData;
  languages: typeof languagesData;
  navigation: typeof navigationData;
  footer: typeof footerData;
  seo: typeof seoData;
  themes: typeof themesData;
  contactMessages: ContactMessage[];
  mediaFiles: Array<{ id: string; filename: string; url: string; type: string; size: number; altText?: string; createdAt: string }>;

  setHero: (data: typeof heroData) => void;
  setProducts: (data: typeof productsData) => void;
  setServices: (data: typeof servicesData) => void;
  setCaseStudies: (data: typeof caseStudiesData) => void;
  setFaq: (data: typeof faqData) => void;
  setPhilosophy: (data: typeof philosophyData) => void;
  setLanguages: (data: typeof languagesData) => void;
  setNavigation: (data: typeof navigationData) => void;
  setFooter: (data: typeof footerData) => void;
  setSeo: (data: typeof seoData) => void;
  setThemes: (data: typeof themesData) => void;
  addContactMessage: (msg: Omit<ContactMessage, "id" | "createdAt" | "status">) => void;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  hero: heroData,
  products: productsData,
  services: servicesData,
  caseStudies: caseStudiesData,
  faq: faqData,
  philosophy: philosophyData,
  languages: languagesData,
  navigation: navigationData,
  footer: footerData,
  seo: seoData,
  themes: themesData,
  contactMessages: JSON.parse(localStorage.getItem("pcl-contact-messages") || "[]"),
  mediaFiles: [],

  setHero: (data) => set({ hero: data }),
  setProducts: (data) => set({ products: data }),
  setServices: (data) => set({ services: data }),
  setCaseStudies: (data) => set({ caseStudies: data }),
  setFaq: (data) => set({ faq: data }),
  setPhilosophy: (data) => set({ philosophy: data }),
  setLanguages: (data) => set({ languages: data }),
  setNavigation: (data) => set({ navigation: data }),
  setFooter: (data) => set({ footer: data }),
  setSeo: (data) => set({ seo: data }),
  setThemes: (data) => set({ themes: data }),
  addContactMessage: (msg) =>
    set((state) => {
      const newMsg: ContactMessage = {
        ...msg,
        id: `msg-${Date.now()}`,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      const updated = [newMsg, ...state.contactMessages];
      localStorage.setItem("pcl-contact-messages", JSON.stringify(updated));
      return { contactMessages: updated };
    }),
  updateContactMessage: (id, updates) =>
    set((state) => {
      const updated = state.contactMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      localStorage.setItem("pcl-contact-messages", JSON.stringify(updated));
      return { contactMessages: updated };
    }),
}));

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
