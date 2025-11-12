import type { MetadataRoute } from 'next';

const BASE_URL = 'https://webarastudio.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: string[] = [
    '',
    '/blog',
    '/privacy-policy',
    '/terms-of-service',
    '/login',
    '/signup',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority:
      route === ''
        ? 1.0
        : route === '/blog'
        ? 0.8
        : route === '/privacy-policy' || route === '/terms-of-service'
        ? 0.3
        : 0.6,
  }));
}
