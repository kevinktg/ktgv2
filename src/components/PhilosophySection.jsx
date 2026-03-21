"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import Link from "next/link";
import { GeometricBackground } from "@/components/GeometricBackground";
import { SplitText } from "@/components/SplitText";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function PhilosophySection({ philosophyData }) {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const quoteRefs = useRef([]);
  const reducedMotion = usePrefersReducedMotion();

  const data = philosophyData || {
    heading: {
      line1: "synthesis",
      line2: "over",
      line3: "specialization",
    },
    description: [
      "Seven careers aren't seven separate lives. They're seven lenses on the same problem: how to synthesize complexity into clarity.",
      "From the precision of a pilot to the creativity of sound engineering, from market dynamics to human teaching—each domain taught a different dimension of problem-solving.",
      "AI is where they all converge.",
    ],
    quotes: [
      {
        text: "Don't just evaluate... collaborate.",
        label: "PRINCIPLE 01",
      },
      {
        text: "Ideation. Brainstorm. Implement. Test. Evaluate. Feedback. Iterate",
        label: "PRINCIPLE 02",
      },
      {
        text: "'Each LLM is wildly unique with patterned traits & features' - April 2024",
        label: "PRINCIPLE 03",
      },
    ],
  };

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      if (reducedMotion) {
        ScrollTrigger.refresh();
        return;
      }

      const headingChars = textRef.current?.querySelectorAll("h2 .split-char");
      if (headingChars?.length) {
        gsap.set(headingChars, { opacity: 0, y: 12 });
        gsap.to(headingChars, {
          opacity: 1,
          y: 0,
          stagger: 0.03,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 78%",
            once: true,
          },
        });
      }

      quoteRefs.current.forEach((el) => {
        if (!el) return;
        const chars = el.querySelectorAll(".split-char");
        if (!chars.length) return;
        gsap.set(chars, { opacity: 0, y: 10 });
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          stagger: 0.022,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      const t = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
      return () => cancelAnimationFrame(t);
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-black py-32 px-6 overflow-hidden z-50">
      <div className="absolute inset-0 z-0">
        <GeometricBackground />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div ref={textRef} className="mb-40">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="mb-8 md:mb-0">
              <div className="text-xs md:text-sm text-white/40 mb-8 tracking-[0.2em] border-l border-white/20 pl-4">
                Philosophy
              </div>
              <h2 className="text-4xl md:text-8xl font-syne font-bold lowercase leading-[0.9] md:leading-[0.85] text-white">
                <span className="block">
                  <SplitText>{data.heading.line1}</SplitText>
                </span>
                <span className="block text-white/40">
                  <SplitText>{data.heading.line2}</SplitText>
                </span>
                <span className="block">
                  <SplitText>{data.heading.line3}</SplitText>
                </span>
              </h2>
            </div>

            <div className="space-y-10 text-white/60 text-lg md:text-xl font-light pt-4">
              <p className="leading-relaxed">{data.description[0]}</p>
              <p className="leading-relaxed">{data.description[1]}</p>
              <p className="text-sm text-white/80 border-l border-white/30 pl-6 py-2 tracking-wide leading-relaxed">
                {data.description[2]}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-32 md:space-y-48">
          {data.quotes.map((quote, index) => (
            <div
              key={index}
              ref={(el) => {
                quoteRefs.current[index] = el;
              }}
              className={`relative group flex ${index % 2 !== 0 ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-4xl relative">
                <div
                  className={`absolute top-0 bottom-0 w-px bg-white/10 group-hover:bg-white/40 transition-colors duration-500 ${index % 2 !== 0 ? "right-0" : "left-0"}`}
                />

                <div className={`${index % 2 !== 0 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                  <div className="text-xs text-white/30 mb-6 tracking-[0.25em]">{quote.label}</div>
                  <blockquote className="text-3xl md:text-6xl font-syne font-bold text-white/90 leading-tight group-hover:text-white transition-colors duration-500">
                    <span className="text-white/50" aria-hidden="true">
                      &ldquo;
                    </span>
                    <SplitText className="inline">{quote.text}</SplitText>
                    <span className="text-white/50" aria-hidden="true">
                      &rdquo;
                    </span>
                  </blockquote>
                </div>

                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 border border-white/20 rotate-45 group-hover:rotate-180 group-hover:scale-150 transition-all duration-700 ${index % 2 !== 0 ? "-left-2" : "-right-2"} bg-black`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-60 text-center space-y-12">
          <div className="inline-block relative group cursor-default">
            <div className="absolute -inset-12 border border-white/5 rounded-full scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out" />
            <div className="absolute -inset-8 border border-white/10 group-hover:border-white/20 transition-colors duration-500" />

            <div className="relative text-lg md:text-2xl px-12 py-8 tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">
              context • continuation • solve
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/blog"
              className="text-xs text-white/30 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 tracking-widest"
            >
              read insights
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
