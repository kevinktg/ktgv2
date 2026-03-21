import { getPosts } from "@/lib/wordpress";

export const revalidate = 3600;

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ktg.one";

  const routes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  let blogRoutes = [];

  try {
    const posts = await getPosts(1, 100);

    if (Array.isArray(posts)) {
      blogRoutes = posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("[Sitemap] Failed to generate blog routes:", error.message);
  }

  return [...routes, ...blogRoutes];
}
