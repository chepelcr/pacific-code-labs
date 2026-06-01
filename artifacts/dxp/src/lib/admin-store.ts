import { create } from "zustand";
import { saveContentFile } from "./local-cms";
import heroData from "../content/hero.json";
import aboutData from "../content/about.json";
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
import legalData from "../content/legal.json";
import settingsData from "../content/settings.json";
import inventoryData from "../content/inventory.json";

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
  about: typeof aboutData;
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
  legal: typeof legalData;
  settings: typeof settingsData;
  inventory: typeof inventoryData;
  contactMessages: ContactMessage[];
  mediaFiles: Array<{ id: string; filename: string; url: string; type: string; size: number; altText?: string; createdAt: string }>;

  setHero: (data: typeof heroData) => void;
  setAbout: (data: typeof aboutData) => void;
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
  setLegal: (data: typeof legalData) => void;
  setSettings: (data: typeof settingsData) => void;
  setInventory: (data: typeof inventoryData) => void;
  addContactMessage: (msg: Omit<ContactMessage, "id" | "createdAt" | "status">) => void;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  hero: heroData,
  about: aboutData,
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
  legal: legalData,
  settings: settingsData,
  inventory: inventoryData,
  contactMessages: JSON.parse(localStorage.getItem("pcl-contact-messages") || "[]"),
  mediaFiles: [],

  setHero: (data) => set({ hero: data }),
  setAbout: (data) => set({ about: data }),
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
  setLegal: (data) => set({ legal: data }),
  setSettings: (data) => set({ settings: data }),
  setInventory: (data) => set({ inventory: data }),
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

export async function downloadJson(filename: string, data: unknown) {
  // In local dev, write straight into the repo file (ready to commit). Falls
  // back to a browser download when the write-back endpoint isn't available.
  if (await saveContentFile(filename, data)) {
    console.info(`[local-cms] saved ${filename} to the repo`);
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
