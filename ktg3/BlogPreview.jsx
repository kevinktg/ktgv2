"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFeaturedImage, formatDate } from "@/lib/wordpress";

gsap.registerPlugin(ScrollTrigger);

// Tolerance for floating-point precision at scroll boundaries
const SCROLL_BOUNDARY_TOLERANCE = 2;

export function BlogPreview({ posts = [] }) {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Check sessionStorage safely on client mount (not in useMemo which runs during SSR/render)
  useEffect(() => {
    if (sessionStorage.getItem("blog-animated") === "true") {
      setHasPlayed(true);
    }
  }, []);

  // Single wheel handler — maps vertical scroll to horizontal within the scroll container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;

      const isVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (!isVertical) return;

      const atStart = el.scrollLeft === 0;
      const atEnd =
        Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) <
        SCROLL_BOUNDARY_TOLERANCE;

      // At boundary heading further out — let the page scroll naturally
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;

      // Hijack vertical scroll for horizontal movement
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useGSAP(
    () => {
      // Set initial state — posts visible
      gsap.set(".blog-post", { opacity: 1, x: 0 });

      if (hasPlayed) return;

      const blogPosts = gsap.utils.toArray(".blog-post");
      if (blogPosts.length === 0) return;

      // Start hidden, animate in on scroll
      gsap.set(blogPosts, { opacity: 0, x: 50 });

      gsap.to(blogPosts, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
          onComplete: () => {
            sessionStorage.setItem("blog-animated", "true");
          },
        },
      });
    },
    { scope: sectionRef, dependencies: [hasPlayed] }
  );

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <section
        ref={sectionRef}
        data-blog-section
        className="relative h-screen flex flex-col justify-center px-6 bg-black text-white overflow-hidden z-[60]"
      >
        <div ref={containerRef} className="max-w-7xl mx-auto w-full">
          <h2 className="font-syne text-4xl md:text-5xl font-bold mb-6 lowercase">
            blog
          </h2>
          <p className="text-muted-foreground">
            No posts available at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-blog-section
      className="relative h-screen max-h-screen flex flex-col justify-center bg-black text-white overflow-hidden z-60"
    >
      <div className="flex-1 flex flex-col justify-center w-full max-w-[100vw]">
        {/* Header */}
        <div className="px-6 md:px-12 mb-8 md:mb-12 shrink-0">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-end">
            <div>
              <h2 className="font-syne text-4xl md:text-6xl font-bold lowercase leading-none">
                blog
              </h2>
              <p className="text-white/40 mt-2 text-sm md:text-base">
                recent_transmissions
              </p>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="p-3 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/30 transition-all active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-3 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/30 transition-all active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <Link
                href="/blog"
                className="hidden md:inline-block text-xs md:text-sm text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 tracking-widest uppercase"
              >
                view all &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="w-full overflow-x-auto pb-8 px-6 md:px-12 flex gap-6 md:gap-8 items-stretch shrink-0 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {posts.map((post, index) => {
            if (!post || !post.title) return null;

            const featuredImage = getFeaturedImage(post);
            const excerpt =
              (post.excerpt?.rendered || post.excerpt || "")
                .replace(/<[^>]*>/g, "")
                .substring(0, 100) + "...";
            const title = post.title?.rendered || post.title || "Untitled";

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="blog-post group relative flex-none w-[75vw] md:w-[400px] snap-center"
              >
                <article className="h-full flex flex-col border border-white/10 hover:border-white/30 transition-colors duration-300 bg-black/80 backdrop-blur-sm rounded-xl overflow-hidden">
                  {featuredImage && (
                    <div className="relative w-full h-48 md:h-56 shrink-0 overflow-hidden bg-white/5">
                      <Image
                        src={featuredImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 75vw, 400px"
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col relative">
                    <div className="flex justify-between items-start mb-3">
                      {post.date && (
                        <time
                          className="text-white/40 text-xs font-mono tracking-widest"
                          dateTime={new Date(post.date).toISOString()}
                        >
                          {formatDate(post.date)}
                        </time>
                      )}
                      <span className="w-2 h-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                    </div>

                    <h3 className="font-syne text-xl md:text-2xl font-bold mb-3 lowercase group-hover:text-white/80 transition-colors leading-tight">
                      {title}
                    </h3>

                    {excerpt && (
                      <p className="text-white/50 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white/30 text-xs tracking-wider group-hover:text-white/70 transition-colors">
                        read entry
                      </span>
                      <span className="text-white/30 group-hover:translate-x-1 transition-transform duration-300">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}

          {/* View All card */}
          <Link
            href="/blog"
            className="blog-post flex-none w-[200px] md:w-[250px] border border-dashed border-white/10 hover:border-white/30 rounded-xl flex flex-col items-center justify-center gap-4 group transition-colors snap-center"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              &rarr;
            </div>
            <span className="text-sm text-white/50 tracking-widest uppercase">
              View Archive
            </span>
          </Link>

          {/* Right padding spacer */}
          <div className="w-6 shrink-0" />
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden shrink-0 pb-8">
          <Link
            href="/blog"
            className="inline-block text-sm text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white/30"
          >
            view all posts &rarr;
          </Link>
        </div>
      </div>

      {/* Marquee Footer */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-white/10 bg-black z-20 py-4">
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-12 animate-scroll hover:[animation-play-state:paused] cursor-default opacity-50">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-12 shrink-0 pr-12"
              >
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">
                  Cognitive Architect
                </span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">
                  Top 0.01%
                </span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">
                  Context Sovereignty
                </span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">
                  Framework Verification
                </span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">
                  Arxiv-Ready Research
                </span>
                <span className="text-white/20">&bull;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
