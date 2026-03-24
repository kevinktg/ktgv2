"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MatterButton } from "@/components/ui/matter-button";
import { Mail, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-24 px-6 md:px-12 z-50 flex justify-center items-center">
      <div className="w-full max-w-4xl relative">
        {/* Decorative elements */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff]/20 to-transparent blur-xl opacity-50 rounded-3xl pointer-events-none" />

        <Card className="relative bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden rounded-3xl">
          {/* Subtle grid background pattern inside card */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
          />

          <CardContent className="p-10 md:p-16 text-center flex flex-col items-center justify-center relative z-10">
            <div className="mb-6 w-16 h-16 border border-[#00f0ff]/30 rounded-2xl flex items-center justify-center bg-[#00f0ff]/10">
              <Mail className="w-6 h-6 text-[#00f0ff]" />
            </div>

            <h2 className="text-3xl md:text-5xl font-syne font-bold mb-4 lowercase leading-tight">
              Ready to collaborate?
            </h2>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              If you need architectural verification, contextual sovereignty, or cognitive software engineering to elevate your next project, my inbox is open.
            </p>

            <a href="mailto:kevin@ktg.one" className="inline-block group">
              <MatterButton size="lg" className="px-8 py-6 rounded-full text-base font-bold tracking-wider">
                contact kevin@ktg.one
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </MatterButton>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
