import type { MetadataRoute } from 'next';

const BASE_URL = 'https://webaraforge.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: string[] = [
    '',
    '/about',
    '/how-it-works',
    '/cohorts',
    '/projects',
    '/members',
    '/partners',
    '/hackathon',
    '/media',
    '/apply',
    '/hire-from-the-forge',
    '/for-institutions',
    '/for-companies',
    '/faq',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ];

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route === '/cohorts' || route === '/projects' ? 'weekly' : 'monthly',
    priority:
      route === ''
        ? 1.0
        : route === '/apply'
          ? 0.9
          : route === '/privacy-policy' || route === '/terms-of-service'
            ? 0.3
            : 0.7,
  }));
}
