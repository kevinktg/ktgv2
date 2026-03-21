"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, forwardRef, useState, useEffect } from "react";

const StatBox = ({ label, value, isFloat, suffix }) => (
  <div className="text-center expertise-group">
    <div className="stat-label text-xs opacity-50 mb-2 tracking-widest">
      {label}
    </div>
    <div
      className="text-4xl md:text-5xl font-syne font-bold stat-counter text-white"
      data-val={value}
      data-is-float={isFloat}
      data-suffix={suffix}
    >
      0
    </div>
  </div>
);

export const ExpertiseSection = forwardRef(({ expertiseData }, ref) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const shutterRef = useRef(null);
  const internalRef = ref || containerRef;
  const [hasPlayed, setHasPlayed] = useState(false);

  const data = expertiseData || [
    {
      category: "PROMPT ENGINEERING",
      skills: [
        "Context continuation strategies",
        "Multi-turn conversation optimization",
        "Chain-of-thought prompting",
        "Few-shot learning patterns",
        "Adversarial prompt testing",
      ],
    },
    {
      category: "AI SOLUTIONS [GoodAI]",
      skills: [
        "LangChain architecture",
        "Custom RAG implementations",
        "Agent-based systems",
        "Embedding strategies",
        "Fine-tuning workflows",
      ],
    },
    {
      category: "AI ANTHROPOLOGY",
      skills: [
        "Neural Pathway Mapping",
        "Cognitive Software Engineering",
        "Reverse-Engineering Engines",
        "Anti-Lazy Protocols",
        "Hallucination Management",
      ],
    },
  ];

  // Check sessionStorage safely on client mount
  useEffect(() => {
    const played = sessionStorage.getItem("expertise-revealed") === "true";
    if (played) setHasPlayed(true);
  }, []);

  useGSAP(
    () => {
      if (!hasPlayed) {
        // Initial hidden state
        if (shutterRef.current?.children) {
          gsap.set(shutterRef.current.children, {
            scaleY: 1,
            transformOrigin: "top",
          });
        }
        gsap.set(".stat-label", { opacity: 0, y: 20 });
        gsap.set(".stat-counter", { opacity: 0, y: 20 });
      } else {
        // Already played — jump to final state
        if (shutterRef.current?.children) {
          gsap.set(shutterRef.current.children, { scaleY: 0 });
        }
        gsap.set(".expertise-title", { opacity: 1, y: 0 });
        gsap.set(".expertise-group", { opacity: 1, y: 0 });
        gsap.set(".stat-label", { opacity: 1, y: 0 });
        gsap.set(".stat-counter", { opacity: 1, y: 0 });

        // Set stats to final values
        const stats = gsap.utils.toArray(".stat-counter");
        stats.forEach((stat) => {
          if (!stat.getAttribute("data-val")) return;
          const targetVal = parseFloat(stat.getAttribute("data-val"));
          const isFloat = stat.getAttribute("data-is-float") === "true";
          const suffix = stat.getAttribute("data-suffix") || "";
          stat.textContent = isFloat
            ? targetVal.toFixed(2) + suffix
            : Math.floor(targetVal) + suffix;
        });
        return;
      }

      // Main timeline with pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 0.5,
          onLeave: () => {
            sessionStorage.setItem("expertise-revealed", "true");
          },
        },
      });

      // A: Shutter reveal
      tl.to(shutterRef.current?.children, {
        scaleY: 0,
        stagger: 0.05,
        ease: "power2.inOut",
        duration: 2,
      });

      // B: Title reveal
      tl.fromTo(
        ".expertise-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, ease: "power2.out", duration: 2 },
        "-=1.5"
      );

      // C: Skills reveal
      const groups = gsap.utils.toArray(".expertise-group");
      tl.fromTo(
        groups,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.5, ease: "power2.out", duration: 3 },
        "-=1"
      );

      // D: Stats labels and values
      const statLabels = gsap.utils.toArray(".stat-label");
      const statValues = gsap.utils.toArray(".stat-counter");
      tl.fromTo(
        statLabels,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.2, ease: "power2.out", duration: 1.5 },
        "-=0.5"
      );
      tl.fromTo(
        statValues,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.2, ease: "power2.out", duration: 1.5 },
        "-=1.5"
      );

      // E: Counter animation
      tl.call(
        () => {
          const stats = gsap.utils.toArray(".stat-counter");
          stats.forEach((stat) => {
            if (
              stat.getAttribute("data-animated") === "true" ||
              !stat.getAttribute("data-val")
            )
              return;

            const targetVal = parseFloat(stat.getAttribute("data-val"));
            const isFloat = stat.getAttribute("data-is-float") === "true";
            const suffix = stat.getAttribute("data-suffix") || "";
            const proxy = { val: 0 };

            gsap.to(proxy, {
              val: targetVal,
              duration: 2,
              ease: "power3.out",
              onUpdate: () => {
                stat.textContent = isFloat
                  ? proxy.val.toFixed(2) + suffix
                  : Math.floor(proxy.val) + suffix;
              },
            });
            stat.setAttribute("data-animated", "true");
          });
        },
        null,
        "-=0.5"
      );
    },
    { scope: containerRef, dependencies: [hasPlayed] }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-white text-black overflow-hidden py-20 z-30"
      // NOTE: content-visibility-auto removed.
      // It tells the browser to skip rendering when off-screen, but GSAP pin: true
      // keeps this element in-viewport via transforms. They fight each other —
      // browser skips paint, GSAP demands paint. Result: blank section flicker.
    >
      {/* Shutters */}
      <div
        ref={shutterRef}
        className="absolute inset-0 z-50 flex pointer-events-none h-full w-full"
        style={{ contain: "layout paint" }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1/5 h-full bg-black border-r border-white/10 ${
              !hasPlayed ? "will-change-transform" : ""
            }`}
            style={{ contain: "strict", transformOrigin: "top" }}
          />
        ))}
      </div>

      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 border-2 border-black/10 rotate-45 opacity-80" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 border-2 border-black/5" />
        <div className="absolute bottom-20 left-20 w-96 h-96 border-2 border-black/10 rounded-full opacity-70" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="relative z-20 max-w-7xl w-full mx-auto px-6 flex flex-col justify-center h-full"
      >
        {/* Header */}
        <h2 className="expertise-title mb-20 text-center text-4xl md:text-6xl font-syne font-bold lowercase tracking-tighter text-black">
          expertise_matrix
        </h2>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-16 mb-12 md:mb-24 grow-0">
          {data.map((area) => (
            <div key={area.category} className="expertise-group relative">
              <div className="mb-8 relative pl-4">
                <div className="absolute left-0 top-0 w-1 h-full bg-black/30" />
                <h3 className="font-syne tracking-wider font-bold text-sm">
                  {area.category}
                </h3>
                <div className="mt-2 w-24 h-0.5 bg-black" />
              </div>
              <ul className="space-y-3 md:space-y-4">
                {area.skills.map((skill, i) => (
                  <li
                    key={i}
                    className="relative pl-6 text-black/60 leading-relaxed text-base"
                  >
                    <span className="absolute left-0 top-2.5 w-1.5 h-1.5 bg-black/30 rotate-45" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-black/10 py-12">
          <div className="text-center expertise-group">
            <div className="stat-label text-xs opacity-50 mb-2 tracking-widest uppercase font-syne">
              Percentile
            </div>
            <div className="stat-counter text-4xl md:text-5xl font-syne font-bold">
              0.01%
            </div>
          </div>

          <div className="text-center expertise-group">
            <div className="stat-label text-xs opacity-50 mb-2 tracking-widest uppercase font-syne">
              Careers
            </div>
            <div className="stat-counter text-4xl md:text-5xl font-syne font-bold">
              7
            </div>
          </div>

          <div className="text-center expertise-group">
            <div className="stat-label text-xs opacity-50 mb-2 tracking-widest uppercase font-syne">
              Domains
            </div>
            <div className="stat-counter text-4xl md:text-5xl font-syne font-bold">
              &infin;
            </div>
          </div>

          <div className="text-center expertise-group">
            <div className="stat-label text-xs opacity-50 mb-2 tracking-widest uppercase font-syne">
              Approach
            </div>
            <div className="stat-counter text-2xl md:text-3xl font-syne font-bold text-black lowercase">
              collaborative
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ExpertiseSection.displayName = "ExpertiseSection";
