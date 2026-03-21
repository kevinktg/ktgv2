import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HeroTransition } from "@/components/HeroTransition";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { ExpertiseTransition } from "@/components/ExpertiseTransition";
import { PhilosophySection } from "@/components/PhilosophySection";
import { Footer } from "@/components/Footer";
import { ValidationSection } from "@/components/ValidationSection";
import { BlogPreview } from "@/components/BlogPreview";
import { getPosts } from "@/lib/wordpress";

// ISR: regenerate every 60s so new blog posts appear quickly
export const revalidate = 60;

export default async function Home() {
  let blogPosts = [];
  try {
    blogPosts = await getPosts(1, 6);
  } catch (error) {
    console.error("[Home] Blog fetch failed:", error.message);
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 
        GeometricBackground lives in layout.jsx (global, fixed).
        Do NOT duplicate it here — causes doubled GPU layers + event listeners.
      */}

      <Header />

      <main className="grow">
        {/* HERO: Black background with blob reveal cursor */}
        <HeroSection />

        {/* TRANSITION: Wipe from hero to geometric background */}
        <HeroTransition />

        {/* EXPERTISE: White background scrolls over geometric bg */}
        <div id="main-content">
          <ExpertiseSection />
        </div>

        {/* TRANSITION: Wipe from expertise (white) to validation (black) */}
        <ExpertiseTransition />

        {/* VALIDATION: Horizontal scroll */}
        <ValidationSection />

        {/* PHILOSOPHY: Parallax quotes */}
        <PhilosophySection />

        {/* BLOG: Grid stagger — server-fetched posts */}
        <BlogPreview posts={blogPosts} />
      </main>

      <Footer />
    </div>
  );
}
