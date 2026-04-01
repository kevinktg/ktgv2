import { notFound } from "next/navigation";
import { getPostBySlug, getPosts, formatDate, getFeaturedImage } from "@/lib/wordpress";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

// OPTIMIZATION:
// 1. Revalidate every 60 seconds (Incremental Static Regeneration)
export const revalidate = 60;
export const dynamicParams = true; // Allow new posts not in generateStaticParams to be fetched on demand

// OPTIMIZATION: 
// 2. Pre-render the first 20 posts at build time for instant speed.
export async function generateStaticParams() {
  const posts = await getPosts(1, 20);
  // Guard clause if API fails during build
  if (!posts || !Array.isArray(posts)) return [];
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | .ktg",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ktg.one';
  const postUrl = `${siteUrl}/blog/${slug}`;
  const excerpt = (post.excerpt?.rendered || "").replace(/<[^>]*>/g, "").substring(0, 160);
  const featuredImage = getFeaturedImage(post) || `${siteUrl}/assets/ktg-one.svg`;
  const publishedTime = new Date(post.date).toISOString();
  
  return {
    title: `${post.title.rendered} | .ktg`,
    description: excerpt,
    openGraph: {
      title: post.title.rendered,
      description: excerpt,
      url: postUrl,
      type: "article",
      publishedTime,
      images: [{ url: featuredImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.rendered,
      description: excerpt,
      images: [featuredImage],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  let post = null;
  
  try {
    post = await getPostBySlug(slug);
  } catch (error) {
    console.error('Error loading blog post:', error);
  }

  if (!post) {
    notFound();
  }

  const featuredImage = getFeaturedImage(post);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ktg.one';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const publishedTime = new Date(post.date).toISOString();

  // JSON-LD for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.rendered,
    description: (post.excerpt?.rendered || "").replace(/<[^>]*>/g, "").substring(0, 200),
    image: featuredImage || `${siteUrl}/assets/ktg-one.svg`,
    datePublished: publishedTime,
    dateModified: post.modified ? new Date(post.modified).toISOString() : publishedTime,
    author: {
      "@type": "Person",
      name: ".ktg",
    },
    publisher: {
      "@type": "Organization",
      name: ".ktg",
      logo: { "@type": "ImageObject", url: `${siteUrl}/assets/ktg-one.svg` },
    },
  };

  return (
    // LAYOUT FIX: 'flex-col min-h-screen' keeps footer at bottom
    <div className="flex flex-col min-h-screen text-white bg-transparent" suppressHydrationWarning>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 text-sm tracking-widest"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            back to blog
          </Link>

          <article
            className="blog-post"
            itemScope
            itemType="https://schema.org/BlogPosting"
          >
            {/* Title */}
            <h1 className="font-syne text-4xl md:text-5xl lg:text-6xl font-bold mb-6 lowercase leading-tight" itemProp="headline">
              {post.title.rendered}
            </h1>
            
            {/* Meta */}
            <div className="flex items-center gap-4 text-white/40 text-sm mb-12 border-b border-white/10 pb-8">
              <time dateTime={publishedTime} itemProp="datePublished">
                {formatDate(post.date)}
              </time>
              <span>•</span>
              <span>.ktg</span>
            </div>

            {/* Featured image or local placeholder when WordPress has no featured media */}
            <div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
              <Image
                src={featuredImage || "/assets/ktg.svg"}
                alt={post.title.rendered}
                width={1200}
                height={630}
                className="w-full h-auto"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                itemProp="image"
              />
            </div>

            {/* Content */}
            <div
              className="blog-post-body prose prose-invert prose-lg max-w-none
                prose-headings:font-syne prose-headings:lowercase
                prose-headings:text-white prose-headings:font-bold
                prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:mt-10 prose-h1:mb-5
                prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-9 prose-h2:mb-4
                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
                prose-p:font-inter prose-p:text-white/80 prose-p:leading-[1.75] prose-p:font-light
                prose-p:text-base md:prose-p:text-lg prose-p:my-4
                prose-a:text-emerald-400 prose-a:underline prose-a:underline-offset-4
                prose-a:decoration-emerald-400/30 hover:prose-a:decoration-emerald-400
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-emerald-400 prose-code:font-mono prose-code:text-sm
                prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
                prose-img:rounded-xl prose-img:border prose-img:border-white/10
                prose-blockquote:border-l-2 prose-blockquote:border-white/20
                prose-blockquote:text-white/60 prose-blockquote:italic prose-blockquote:pl-6
                prose-ul:text-white/80 prose-ul:my-6 prose-ol:text-white/80 prose-ol:my-6
                prose-li:text-white/80 prose-li:my-1.5 prose-li:leading-[1.75] prose-li:marker:text-white/30
                prose-hr:border-white/10 [&>*:first-child]:mt-0"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </article>

          {/* Post-read Navigation */}
          <div className="mt-20 pt-10 border-t border-white/10">
            <div className="flex justify-between items-center">
              <Link
                href="/blog"
                className="text-white hover:text-white/70 transition-colors text-sm"
              >
                view all posts
              </Link>
              <Link
                 href="/"
                 className="text-white hover:text-white/70 transition-colors text-sm"
              >
                 home
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}