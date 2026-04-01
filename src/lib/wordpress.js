/**
 * WordPress REST API client
 *
 * Fetch policy (matches .planning/PROJECT.md Constraints):
 * - Health / connection checks → cache: 'no-store' (live CMS reachability).
 * - Post list + post-by-slug reads → next: { revalidate: 60 } (ISR, balance freshness vs load).
 */
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://lawngreen-mallard-558077.hostingersite.com';
const REQUEST_TIMEOUT = 10000; // 10 second timeout

// Helper: fetch with timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Test WordPress connection
export async function testWordPressConnection() {
  try {
    const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2`, {
      cache: 'no-store',
    });
    return response.ok;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('WordPress connection test timed out');
    } else {
      console.error('WordPress connection test failed:', error);
    }
    return false;
  }
}

// Fetch all blog posts
export async function getPosts(page = 1, perPage = 10) {
  try {
    const url = `${WORDPRESS_URL}/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds for dynamic pages
      headers: {
        'User-Agent': 'Next.js WordPress Client',
        'Accept': 'application/json',
        'Referer': WORDPRESS_URL,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`WordPress API error: ${response.status} - ${response.statusText}`);
      console.error(`URL: ${url}`);
      console.error(`Response: ${errorText.substring(0, 200)}`);

      // Try without _embed if 403
      if (response.status === 403) {
        console.warn('Attempting fetch without _embed parameter...');
        const fallbackResponse = await fetchWithTimeout(
          `${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}`,
          {
            next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
            headers: {
              'User-Agent': 'Next.js WordPress Client',
              'Accept': 'application/json',
              'Referer': WORDPRESS_URL,
            },
          }
        );

        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      }

      return [];
    }

    const data = await response.json();
    
    // Validate response is an array
    if (!Array.isArray(data)) {
      console.error('WordPress API returned non-array response:', typeof data);
      return [];
    }
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('WordPress API request timed out');
    } else {
      console.error('Error fetching WordPress posts:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    }
    return [];
  }
}

// Fetch a single post by slug
export async function getPostBySlug(slug) {
  try {
    const url = `${WORDPRESS_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds for dynamic pages
      headers: {
        'User-Agent': 'Next.js WordPress Client',
        'Accept': 'application/json',
        'Referer': WORDPRESS_URL,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`WordPress API error: ${response.status} - ${response.statusText}`);
      console.error(`URL: ${url}`);
      console.error(`Response: ${errorText.substring(0, 200)}`);

      // Try without _embed if 403
      if (response.status === 403) {
        console.warn('Attempting fetch without _embed parameter...');
        const fallbackResponse = await fetchWithTimeout(
          `${WORDPRESS_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}`,
          {
            next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
            headers: {
              'User-Agent': 'Next.js WordPress Client',
              'Accept': 'application/json',
              'Referer': WORDPRESS_URL,
            },
          }
        );

        if (fallbackResponse.ok) {
          const posts = await fallbackResponse.json();
          return posts.length > 0 ? posts[0] : null;
        }
      }

      return null;
    }

    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('WordPress API request timed out');
    } else {
      console.error('Error fetching WordPress post:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    }
    return null;
  }
}

// Get featured image URL
export function getFeaturedImage(post) {
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return null;
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

