import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { pathToSectionId, SECTION_SLUGS } from "@/lib/sections";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { HeroSection } from "@/components/public/HeroSection";
import { ProductsSection } from "@/components/public/ProductsSection";
import { ServicesSection } from "@/components/public/ServicesSection";
import { AboutSection } from "@/components/public/AboutSection";
import { PhilosophySection } from "@/components/public/PhilosophySection";
import { CaseStudiesSection } from "@/components/public/CaseStudiesSection";
import { ContactFaqSection } from "@/components/public/ContactFaqSection";
import { FooterSection } from "@/components/public/FooterSection";

export function PublicWebsite() {
  const [location, navigate] = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;
  // When true, the next location-change is from scroll-spy, so don't re-scroll.
  const suppressScrollRef = useRef(false);
  // Ignore scroll-spy until this timestamp (while a programmatic scroll animates).
  const programmaticUntilRef = useRef(0);

  // Scroll to the section that matches the current path whenever it changes.
  // Handles nav clicks, hero CTAs, deep links, and browser back/forward.
  useEffect(() => {
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false;
      return;
    }
    const id = pathToSectionId(location);
    programmaticUntilRef.current = Date.now() + 800; // pause scroll-spy during the animation
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

  // Scroll-spy: update the URL to match the section crossing the viewport
  // centre, without adding history entries or triggering the scroll effect.
  useEffect(() => {
    const ids = ["hero", ...SECTION_SLUGS];
    const observed = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < programmaticUntilRef.current) return;
        const hit = entries.find((e) => e.isIntersecting);
        if (!hit) return;
        const id = hit.target.id;
        const path = id === "hero" ? "/" : `/${id}`;
        if (path !== locationRef.current) {
          suppressScrollRef.current = true;
          navigate(path, { replace: true });
        }
      },
      // A thin band across the viewport centre → one section "active" at a time.
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [navigate]);

  return (
    <div className="min-h-screen" data-testid="public-website">
      <PublicNavbar />
      {/* Wrapper animated on language switch (navbar stays outside so its
          fixed positioning isn't affected by the transform). */}
      <div id="page-content">
        <HeroSection />
        <ProductsSection />
        <ServicesSection />
        <AboutSection />
        <PhilosophySection />
        <CaseStudiesSection />
        <ContactFaqSection />
        <FooterSection />
      </div>
    </div>
  );
}
