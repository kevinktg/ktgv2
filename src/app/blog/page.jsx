import Link from "next/link";
import Image from "next/image";
import { getPosts, formatDate, getFeaturedImage } from "@/lib/wordpress";
import { Footer } from "@/components/Footer";

// OPTIMIZATION: 
// Switch from 'force-dynamic' to ISR (60 seconds).
// This serves the page INSTANTLY from cache, then updates in background.
// Huge boost for TTFB (Time to First Byte).
export const revalidate = 60; 

export const metadata = {
  title: "Blog | .ktg - AI Anthropology & Prompt Engineering Insights",
  description: "Thoughts, insights, and updates on AI anthropology, prompt engineering, LLM optimization, and the future of human-AI collaboration.",
  keywords: ["AI anthropology", "prompt engineering", "LLM optimization", "AI insights", "machine learning"],
  openGraph: {
    title: "Blog | .ktg",
    description: "Insights from a top 0.01% prompt engineer.",
    type: "website",
    siteName: ".ktg",
  },
};

export default async function BlogPage() {
  let posts = [];
  
  try {
    // 1. Fetch posts (now safely cached for 60s)
    posts = await getPosts();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    // Graceful fallback so the page doesn't crash
    posts = [];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ktg.one';

  // 2. JSON-LD for SEO (Google Rich Results)
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: ".ktg Blog",
    description: "AI Anthropology & Prompt Engineering Insights",
    url: `${siteUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: ".ktg",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/ktg-one.svg`,
      },
    },
    blogPost: posts.filter(p => p?.title).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title?.rendered || post.title || 'Untitled',
      url: `${siteUrl}/blog/${post.slug || post.id}`,
      datePublished: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
      image: getFeaturedImage(post) || `${siteUrl}/assets/ktg-one.svg`,
    })),
  };

  return (
    <div className="flex flex-col min-h-screen relative w-full bg-transparent">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="font-syne text-5xl md:text-6xl font-bold mb-4 lowercase text-white">
              blog
            </h1>
            <p className="text-white/60 text-lg">
              thoughts, insights, and updates
            </p>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/40 mb-2">No posts found.</p>
              <p className="text-white/30 text-sm">
                System awaiting input from WordPress...
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {posts.map((post) => {
                if (!post?.title) return null;

                const featuredImage = getFeaturedImage(post);
                const title = post.title?.rendered || post.title || 'Untitled';
                // Strip HTML tags for the preview text
                const excerpt = (post.excerpt?.rendered || post.excerpt || '')
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 150) + "...";

                return (
                  <article
                    key={post.id}
                    className="group relative flex flex-col md:flex-row gap-8 pb-12 border-b border-white/10 last:border-0"
                  >
                    {/* OPTIMIZATION: Image container */}
                    {featuredImage && (
                      <div className="w-full md:w-1/3 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
                        <Image
                          src={featuredImage}
                          alt={title}
                          width={600}
                          height={400}
                          className="w-full h-56 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          // OPTIMIZATION: 'sizes' helps browser download smaller images on mobile
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <Link href={`/blog/${post.slug}`} className="block focus:outline-none">
                        <h2 className="font-syne text-3xl font-bold mb-3 text-white group-hover:text-white/70 transition-colors lowercase">
                          {title}
                        </h2>
                        
                        <div className="text-white/40 text-sm mb-4 flex items-center gap-2">
                          <time dateTime={post.date} className="drop-shadow-md">
                            {formatDate(post.date)}
                          </time>
                          <span className="drop-shadow-md">•</span>
                          <span className="drop-shadow-md">ai anthropology</span>
                        </div>

                        <p className="text-white/70 leading-relaxed mb-4">
                          {excerpt}
                        </p>

                        <span className="inline-block text-sm text-white/50 border-b border-transparent group-hover:border-white/50 transition-all">
                          read full entry →
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}