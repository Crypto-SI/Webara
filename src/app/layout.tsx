import type { Metadata } from 'next';

import { Toaster } from '@/components/ui/toaster';

import './globals.css';
import { ClientProviders } from './providers-client';

export const metadata: Metadata = {
  metadataBase: new URL('https://webaraforge.com'),
  title: {
    default: 'Webara Forge | Startups are forged here',
    template: '%s | Webara Forge',
  },
  description:
    'Webara Forge is a selective hacker house and venture studio in Tema, Ghana. Build, validate, and ship in a high-pressure 14-week model.',
  alternates: {
    canonical: 'https://webaraforge.com',
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    'Webara Forge',
    'hacker house Ghana',
    'venture studio Ghana',
    'startup accelerator Tema',
    'startup talent Ghana',
    'hackathon Ghana',
  ],
  authors: [{ name: 'Webara Forge', url: 'https://webaraforge.com' }],
  creator: 'Webara Forge',
  publisher: 'Webara Forge',
  openGraph: {
    type: 'website',
    url: 'https://webaraforge.com',
    title: 'Webara Forge | Startups are forged here',
    description:
      'A selective hacker house and venture studio documenting cohorts, projects, members, and proof of output.',
    siteName: 'Webara Forge',
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
  icons: {
    icon: [
      { url: '/W.webp', sizes: 'any', type: 'image/webp' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon.ico', rel: 'shortcut icon' },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon/favicon.ico',
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <head />
      <body className="font-body antialiased">
        <ClientProviders>{children}</ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
