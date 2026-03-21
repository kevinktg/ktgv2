import { Header } from "@/components/Header";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Expertise | .ktg - AI Architecture & Prompt Engineering",
  description:
    "Detailed breakdown of technical capabilities: LLM Optimization, RAG Pipelines, Python/React Engineering, and Enterprise AI Strategy.",
  keywords: [
    "Prompt Engineering",
    "RAG",
    "LLM Ops",
    "AI Strategy",
    "Python",
    "React",
    "Next.js",
  ],
  openGraph: {
    title: "Expertise | .ktg",
    description: "Technical capabilities and AI engineering frameworks.",
    type: "website",
  },
};

export default function ExpertisePage() {
  return (
    <div className="flex flex-col min-h-screen relative w-full bg-transparent">
      <Header />

      <main className="flex-1 w-full pt-20">
        <ExpertiseSection />
      </main>

      <Footer />
    </div>
  );
}
