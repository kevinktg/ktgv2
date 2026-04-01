import { HeroSection } from "@/components/HeroSection";
import { HeroTransition } from "@/components/HeroTransition";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { ExpertiseTransition } from "@/components/ExpertiseTransition";
import { PhilosophySection } from "@/components/PhilosophySection";
import { Footer } from "@/components/Footer";
import { ValidationSection } from "@/components/ValidationSection";
import { ContactCTA } from "@/components/ContactCTA";
import { GeometricBackground } from "@/components/GeometricBackground";

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col relative" suppressHydrationWarning>
      {/* Global background with gradient glow and grid - reactive to cursor */}
      <GeometricBackground fixed />
      
      <main className="grow" suppressHydrationWarning>

        {/* HERO: Black Background with blob reveal cursor */}
        <HeroSection />

        {/* TRANSITION: Wipe from hero to geometric background */}
        <HeroTransition />

        {/* EXPERTISE: White Background (Scrolls over geometric bg) */}
        <div id="main-content">
          <ExpertiseSection />
        </div>

        {/* TRANSITION: Wipe from expertise (white) to validation (black) */}
        <ExpertiseTransition />

        {/* VALIDATION: Black Background (Horizontal Scroll) */}
        <ValidationSection />

        {/* PHILOSOPHY: Black Background (Parallax Quotes) */}
        <PhilosophySection />

        {/* CONTACT: CTA Form */}
        <ContactCTA />

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}