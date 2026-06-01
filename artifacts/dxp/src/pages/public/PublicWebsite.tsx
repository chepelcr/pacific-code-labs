import { useEffect } from "react";
import { useLocation } from "wouter";
import { pathToSectionId } from "@/lib/sections";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { HeroSection } from "@/components/public/HeroSection";
import { ProductsSection } from "@/components/public/ProductsSection";
import { ServicesSection } from "@/components/public/ServicesSection";
import { AboutSection } from "@/components/public/AboutSection";
import { PhilosophySection } from "@/components/public/PhilosophySection";
import { CaseStudiesSection } from "@/components/public/CaseStudiesSection";
import { FaqSection } from "@/components/public/FaqSection";
import { ContactSection } from "@/components/public/ContactSection";
import { FooterSection } from "@/components/public/FooterSection";

export function PublicWebsite() {
  const [location] = useLocation();

  // Scroll to the section that matches the current path whenever it changes.
  // Handles nav clicks, hero CTAs, deep links, and browser back/forward.
  useEffect(() => {
    const id = pathToSectionId(location);
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Defer to ensure the target section is in the DOM before scrolling.
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [location]);

  return (
    <div className="min-h-screen" data-testid="public-website">
      <PublicNavbar />
      <HeroSection />
      <ProductsSection />
      <ServicesSection />
      <AboutSection />
      <PhilosophySection />
      <CaseStudiesSection />
      <FaqSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
