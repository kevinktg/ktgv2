"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function ContactCTA() {
  return (
    <section id="contact" className="relative py-24 md:py-32 px-6 md:px-12 z-[60]">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-syne text-4xl md:text-5xl font-bold lowercase mb-4 text-white">
          get in touch
        </h2>
        <p className="text-white/40 mb-4 text-sm md:text-base">
          have a project, question, or just want to talk AI?
        </p>
        <p className="text-white/35 mb-12 text-sm md:text-base lowercase">
          want to try the tool surface first?{" "}
          <Link
            href="/hub/chat"
            className="text-[#00f0ff]/90 hover:text-[#00f0ff] underline-offset-4 hover:underline"
          >
            open hub chat
          </Link>
          .
        </p>

        <Separator className="mb-12 bg-white/10" />

        <form
          action="mailto:kevin@ktg.one"
          method="POST"
          encType="text/plain"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/60 text-xs tracking-widest font-syne">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="your name"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/10 rounded-lg h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-xs tracking-widest font-syne">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/10 rounded-lg h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white/60 text-xs tracking-widest font-syne">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="what's on your mind?"
              rows={5}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/10 rounded-lg resize-none"
            />
          </div>

          <Button
            type="submit"
            className="bg-emerald-500/90 hover:bg-emerald-500 text-white font-syne tracking-widest text-sm h-11 px-8 rounded-full transition-all duration-300"
          >
            send message
          </Button>
        </form>
      </div>
    </section>
  );
}
