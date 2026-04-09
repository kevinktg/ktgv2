"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Register ScrollTrigger safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ToolsSection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray(".tool-card");

    // Set initial state
    gsap.set(cards, { opacity: 0, y: 50 });

    // Staggered reveal animation
    ScrollTrigger.batch(cards, {
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
          overwrite: true
        });
      },
      start: "top 85%",
      once: true
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-black text-white py-32 px-6 z-40" id="tools-section">
      <div ref={containerRef} className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-20">
          <h2 className="font-syne text-4xl md:text-6xl font-bold mb-6 lowercase">
            laboratory
          </h2>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed">
            Consolidated hub of techniques, experiments, and architectural patterns.
            <br />
            Powered by Vercel AI SDK and Next.js.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: Prompt Engineering */}
          <div className="tool-card group relative p-8 border border-white/10 bg-white/5 rounded-2xl overflow-hidden hover:border-white/30 transition-colors duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="w-5 h-5 text-white/50" />
            </div>
            <div className="h-12 w-12 mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <span className="font-mono text-emerald-400 font-bold">01</span>
            </div>
            <h3 className="font-syne text-2xl font-bold mb-3">Prompt Engineering</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Advanced context continuation strategies and chain-of-thought optimization patterns.
            </p>
            <div className="mt-auto">
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                Technique
              </span>
            </div>
          </div>

          {/* Card 2: RAG Architectures */}
          <div className="tool-card group relative p-8 border border-white/10 bg-white/5 rounded-2xl overflow-hidden hover:border-white/30 transition-colors duration-300">
            <div className="h-12 w-12 mb-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <span className="font-mono text-blue-400 font-bold">02</span>
            </div>
            <h3 className="font-syne text-2xl font-bold mb-3">RAG Architectures</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Retrieval-Augmented Generation using vector embeddings and semantic search.
            </p>
            <div className="mt-auto flex gap-2">
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                Architecture
              </span>
            </div>
          </div>

          {/* Card 3: Vercel AI SDK (Interactive Placeholder) */}
          <div className="tool-card group relative p-8 border border-white/10 bg-white/5 rounded-2xl overflow-hidden hover:border-white/30 transition-colors duration-300">
            <div className="absolute inset-0 bg-linear-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="h-12 w-12 mb-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <span className="font-mono text-purple-400 font-bold">AI</span>
            </div>
            <h3 className="font-syne text-2xl font-bold mb-3">AI Playground</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Interactive streaming chat interface powered by Vercel AI SDK.
            </p>

            {/* Placeholder Input UI */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-white/40 font-mono">System Ready</span>
              </div>
              <div className="mt-2 text-xs text-white/30 font-mono">
                &gt; Awaiting input keys...
              </div>
            </div>

            <div className="mt-auto">
              <span className="text-xs font-mono text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                Interactive
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

