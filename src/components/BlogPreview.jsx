"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedImage, formatDate } from "@/lib/wordpress";

gsap.registerPlugin(ScrollTrigger);

export function BlogPreview({ posts = [] }) {
  const sectionRef = useRef(null);

  const hasPlayed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('blog-animated') === 'true';
  }, []);

  useGSAP(() => {
    gsap.set(".blog-card", { opacity: 1, y: 0 });

    if (hasPlayed) return;

    const cards = gsap.utils.toArray(".blog-card");
    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 60 });

    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      onComplete: () => {
        sessionStorage.setItem("blog-animated", "true");
      },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    });
  }, { scope: sectionRef, dependencies: [hasPlayed] });

  if (!posts || posts.length === 0) {
    return (
      <section ref={sectionRef} data-blog-section className="relative py-24 px-6 text-white z-[60]" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="font-syne text-4xl md:text-5xl font-bold mb-6 lowercase">blog</h2>
          <p className="text-muted-foreground">No posts available at the moment.</p>
        </div>
      </section>
    );
  }

  // Tiered sizes: first card is large (featured), rest alternate medium/small
  const tierPattern = ['lg', 'md', 'sm', 'md', 'sm', 'md'];

  return (
    <section
      ref={sectionRef}
      data-blog-section
      className="relative py-24 md:py-32 px-6 md:px-12 text-white z-[60]"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex justify-between items-end mb-12 md:mb-16">
          <div>
            <h2 className="font-syne text-4xl md:text-6xl font-bold lowercase leading-none">blog</h2>
            <p className="text-white/40 mt-2 text-sm md:text-base">recent_transmissions</p>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-block text-xs md:text-sm text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 tracking-widest uppercase"
          >
            view all &rarr;
          </Link>
        </div>

        {/* Tiered Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {posts.map((post, index) => {
            if (!post || !post.title) return null;

            const featuredImage = getFeaturedImage(post);
            const excerpt = (post.excerpt?.rendered || post.excerpt || '')
              .replace(/<[^>]*>/g, "")
              .substring(0, 120) + "...";
            const title = post.title?.rendered || post.title || 'Untitled';
            const tier = tierPattern[index] || 'sm';

            // Grid span based on tier
            const colSpan = tier === 'lg' ? 'md:col-span-8' : tier === 'md' ? 'md:col-span-4' : 'md:col-span-4';
            const imgHeight = tier === 'lg' ? 'h-64 md:h-80' : tier === 'md' ? 'h-48 md:h-56' : 'h-40 md:h-48';

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`blog-card group ${colSpan}`}
              >
                <article className="h-full flex flex-col border border-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/5">
                  {featuredImage && (
                    <div className={`relative w-full ${imgHeight} shrink-0 overflow-hidden bg-white/5`}>
                      <Image
                        src={featuredImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes={tier === 'lg' ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
                    </div>
                  )}

                  <div className="p-5 md:p-6 flex-1 flex flex-col">
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

                    <h3 className={`font-syne font-bold mb-3 lowercase group-hover:text-white/80 transition-colors leading-tight ${tier === 'lg' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                      {title}
                    </h3>

                    {tier !== 'sm' && excerpt && (
                      <p className="text-white/50 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-white/30 text-xs tracking-wider group-hover:text-white/70 transition-colors">
                        read entry
                      </span>
                      <span className="text-white/30 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Mobile View All */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-block text-sm text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white/30"
          >
            view all posts &rarr;
          </Link>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="mt-20 md:mt-28 w-full overflow-hidden border-t border-white/10 py-4">
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-12 animate-scroll hover:[animation-play-state:paused] cursor-default opacity-50">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 shrink-0 pr-12">
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">AI Whisperer</span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">Top 0.01%</span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">Context Sovereignty</span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">Framework Verification</span>
                <span className="text-white/20">&bull;</span>
                <span className="text-xs md:text-sm text-white/70 tracking-wider font-mono">Arxiv-Ready Research</span>
                <span className="text-white/20">&bull;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
