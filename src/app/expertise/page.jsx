import { ExpertiseSection } from "@/components/ExpertiseSection";
import { Footer } from "@/components/Footer";

// OPTIMIZATION: SEO Metadata for the dedicated Expertise page
export const metadata = {
  title: "Expertise | .ktg - AI Architecture & Prompt Engineering",
  description: "Detailed breakdown of technical capabilities: LLM Optimization, RAG Pipelines, Python/React Engineering, and Enterprise AI Strategy.",
  keywords: ["Prompt Engineering", "RAG", "LLM Ops", "AI Strategy", "Python", "React", "Next.js"],
  openGraph: {
    title: "Expertise | .ktg",
    description: "Technical capabilities and AI engineering frameworks.",
    type: "website",
  },
};

export default function ExpertisePage() {
  return (
    // OPTIMIZATION: 'flex flex-col min-h-screen' ensures footer hits bottom on large screens
    <div className="flex flex-col min-h-screen relative w-full bg-transparent" suppressHydrationWarning>
      <main className="flex-1 w-full pt-20" suppressHydrationWarning>
        {/* Reuse the ExpertiseSection. 
           Since this is a dedicated page, the section will take center stage.
           Ensure ExpertiseSection uses 'w-full' and 'max-w' internally.
        */}
        <ExpertiseSection />
      </main>

      <Footer />
    </div>
  );
}