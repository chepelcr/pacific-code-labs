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
