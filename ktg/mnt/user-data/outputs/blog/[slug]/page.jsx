import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getPosts,
  formatDate,
  getFeaturedImage,
} from "@/lib/wordpress";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await getPosts(1, 20);
    if (!posts || !Array.isArray(posts)) return [];
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found | .ktg" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ktg.one";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const excerpt = (post.excerpt?.rendered || "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 160);
  const featuredImage =
    getFeaturedImage(post) || `${siteUrl}/assets/ktg-one.svg`;
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
    console.error("[BlogPost] Failed to load:", error.message);
  }

  if (!post) {
    notFound();
  }

  const featuredImage = getFeaturedImage(post);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ktg.one";
  const publishedTime = new Date(post.date).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.rendered,
    description: (post.excerpt?.rendered || "")
      .replace(/<[^>]*>/g, "")
      .substring(0, 200),
    image: featuredImage || `${siteUrl}/assets/ktg-one.svg`,
    datePublished: publishedTime,
    dateModified: post.modified
      ? new Date(post.modified).toISOString()
      : publishedTime,
    author: { "@type": "Person", name: ".ktg" },
    publisher: {
      "@type": "Organization",
      name: ".ktg",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/ktg-one.svg`,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-transparent">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 text-sm tracking-widest"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              &larr;
            </span>{" "}
            back to blog
          </Link>

          <article itemScope itemType="https://schema.org/BlogPosting">
            <h1
              className="font-syne text-4xl md:text-5xl lg:text-6xl font-bold mb-6 lowercase leading-tight"
              itemProp="headline"
            >
              {post.title.rendered}
            </h1>

            <div className="flex items-center gap-4 text-white/40 text-sm mb-12 border-b border-white/10 pb-8">
              <time dateTime={publishedTime} itemProp="datePublished">
                {formatDate(post.date)}
              </time>
              <span>&bull;</span>
              <span>.ktg</span>
            </div>

            {featuredImage && (
              <div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                <Image
                  src={featuredImage}
                  alt={post.title.rendered}
                  width={1200}
                  height={630}
                  className="w-full h-auto"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  itemProp="image"
                />
              </div>
            )}

            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-syne prose-headings:lowercase
                prose-headings:text-white prose-headings:font-bold
                prose-p:text-white/80 prose-p:leading-relaxed prose-p:font-light
                prose-a:text-white prose-a:underline prose-a:underline-offset-4
                prose-a:decoration-white/30 hover:prose-a:decoration-white
                prose-strong:text-white prose-strong:font-bold
                prose-code:text-emerald-400 prose-code:font-mono prose-code:text-sm
                prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-white/10
                prose-img:rounded-xl prose-img:shadow-2xl
                prose-blockquote:border-l-white/20 prose-blockquote:text-white/60 prose-blockquote:italic
                prose-li:marker:text-white/30"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </article>

          {/* Post-read nav */}
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
