import type { Metadata } from 'next';
import React from 'react';

import { Footer } from '@/components/layout/footer';
import { MarketingHeader } from '@/components/layout/marketing-header';

const siteUrl = 'https://webaraforge.com';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Webara Forge',
  url: siteUrl,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Webara Forge | Startups are forged here',
    template: '%s | Webara Forge',
  },
  description:
    'Webara Forge is a selective hacker house and venture studio in Tema, Ghana. Build, validate, and ship in a high-pressure 14-week model.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Webara Forge | Startups are forged here',
    description:
      'A selective hacker house and venture studio documenting cohorts, members, projects, and measurable proof of work.',
    url: siteUrl,
    type: 'website',
    images: [
      {
        url: '/webarabadge.webp',
        width: 1200,
        height: 630,
        alt: 'Webara Forge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webara Forge | Startups are forged here',
    description:
      'Selective 14-week venture studio cohorts in Tema, Ghana. Build under pressure and show proof of output.',
    images: ['/webarabadge.webp'],
  },
};

function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
    />
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell">
      <StructuredData />
      <MarketingHeader />
      <main className="page-main">{children}</main>
      <Footer />
    </div>
  );
}
