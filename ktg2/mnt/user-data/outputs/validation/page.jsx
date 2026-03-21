import { Header } from "@/components/Header";
import { ValidationSection } from "@/components/ValidationSection";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Validation | .ktg - Client Results & AI Case Studies",
  description:
    "Proven track record of deploying autonomous AI agents, reducing operational costs, and optimizing workflows for SMEs.",
  keywords: [
    "AI Case Studies",
    "Client Testimonials",
    "AI ROI",
    "Business Automation Results",
    "Good AI",
  ],
  openGraph: {
    title: "Validation | .ktg",
    description: "Real-world results from AI implementation.",
    type: "website",
  },
};

export default function ValidationPage() {
  return (
    <div className="flex flex-col min-h-screen relative w-full bg-transparent">
      <Header />

      <main className="flex-1 w-full pt-20">
        <ValidationSection />
      </main>

      <Footer />
    </div>
  );
}
