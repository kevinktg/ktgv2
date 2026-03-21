import { Syne, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { GeometricBackground } from "@/components/GeometricBackground";
import { CursorDot } from "@/components/CursorDot";

// OPTIMIZATION: 'swap' ensures text is visible immediately with fallback font,
// then swaps to the loaded Google Font. Fallback chains are type-matched.
const syne = Syne({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // FIX: Was monospace fallback — if Inter failed, entire site rendered in monospace.
  // Now falls back to proper sans-serif stack.
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata = {
  metadataBase: new URL("https://ktg.one"),
  title: {
    default: ".ktg | Distinguished Cognitive Architect",
    template: "%s | .ktg",
  },
  description:
    "Portfolio of a top 0.01% prompt engineer. Cognitive Software Engineering & Cross-world reasoning across 7 careers.",
  icons: {
    icon: "/assets/ktg.svg",
    shortcut: "/assets/ktg.svg",
  },
  openGraph: {
    title: ".ktg | Top 0.01% Prompt Engineer",
    description: "Context continuation solve. Frameworks. Arxiv-ready papers.",
    type: "website",
    locale: "en_AU",
    siteName: ".ktg Portfolio",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ktg Portfolio Preview",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-black">
      <head />
      <body
        className={`${syne.variable} ${inter.variable} antialiased text-foreground overflow-x-hidden selection:bg-white selection:text-black relative`}
        suppressHydrationWarning
      >
        <ClientLayout>
          {/* Single global GeometricBackground — fixed position, behind all content.
              Do NOT add another instance in page.jsx or any route page. */}
          <GeometricBackground fixed />

          {children}
          <SpeedInsights />

          {/* CursorDot must be last child to stay above all stacking contexts */}
          <CursorDot />
        </ClientLayout>
      </body>
    </html>
  );
}
