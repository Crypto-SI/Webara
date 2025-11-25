// src/app/(marketing)/layout.tsx
import type { Metadata } from 'next';
import React from 'react';

const siteUrl = 'https://webarastudio.com';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Webara Studio',
  url: siteUrl,
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the profit-share pricing work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You choose how much new digital revenue to share with Webara in exchange for discounts on build costs—up to fully funded projects when partnership depth increases.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you build SaaS and B2B products as well as marketing sites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We design and ship SaaS, B2B platforms, and high-converting marketing sites, including AI automations for bookings, support, and ops.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast can we launch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most MVPs and marketing sites launch within weeks. Timelines depend on scope, but we prioritize fast, collaborative delivery with transparent retainers.',
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Webara Studio | SaaS & B2B Product Partner',
    template: '%s | Webara Studio',
  },
  description:
    'Webara Studio co-builds SaaS and B2B products with transparent retainers, shared IP, and enterprise delivery—launch faster with a partner who ships.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Webara Studio | SaaS & B2B Product Partner',
    description:
      'Co-create modern, performant web apps and marketing sites. Transparent retainers, shared IP, and results-focused builds.',
    url: siteUrl,
    type: 'website',
    images: [
      {
        url: '/webarabadge.webp',
        width: 1200,
        height: 630,
        alt: 'Webara Studio — SaaS & B2B Product Partner',
      },
      {
        url: '/webarabadge.png',
        width: 800,
        height: 420,
        alt: 'Webara Studio — SaaS & B2B Product Partner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webara Studio | SaaS & B2B Product Partner',
    description:
      'Webara Studio builds high-converting, performant web experiences in partnership with your team.',
    images: ['/webarabadge.png'],
  },
};

function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData />
      {children}
    </>
  );
}
