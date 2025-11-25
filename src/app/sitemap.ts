import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-posts';

const BASE_URL = 'https://webarastudio.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: string[] = [
    '',
    '/blog',
    '/services',
    '/case-studies',
    '/pricing',
    '/privacy-policy',
    '/terms-of-service',
    '/login',
    '/signup',
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority:
      route === ''
        ? 1.0
        : route === '/blog'
        ? 0.8
        : route === '/privacy-policy' || route === '/terms-of-service'
        ? 0.3
        : 0.6,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
