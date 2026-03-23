import { HeroSection } from "@/components/HeroSection";
import { HeroTransition } from "@/components/HeroTransition";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { ExpertiseTransition } from "@/components/ExpertiseTransition";
import { PhilosophySection } from "@/components/PhilosophySection";
import { Footer } from "@/components/Footer";
import { ValidationSection } from "@/components/ValidationSection";
import { BlogPreview } from "@/components/BlogPreview";
import { GeometricBackground } from "@/components/GeometricBackground";
import { getPosts } from "@/lib/wordpress";

// Force dynamic rendering if you want new blog posts to appear instantly on refresh
// or use 'export const revalidate = 3600' to cache for 1 hour.
export const revalidate = 60;

export default async function Home() {
  // 1. FETCH DATA ON SERVER
  // This runs on the server before the page is sent to the browser.
  let blogPosts = [];
  try {
    // Attempt to fetch posts. If WP is down, it won't crash the whole site.
    blogPosts = await getPosts(1, 6);
  } catch (error) {
    // Continue - BlogPreview will show loading state
  }

  // 2. DEFINE DATA FOR OTHER SECTIONS (Optional)
  // You can fetch this from WP too, or define it here to keep the components "dumb"
  // For now, we rely on the default props inside the components,
  // but this is where you would pass "heroData", "expertiseData", etc.

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

        {/* BLOG: Black Background (Grid Stagger) */}
        {/* We pass the server-fetched posts here */}
        <BlogPreview posts={blogPosts} />

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}