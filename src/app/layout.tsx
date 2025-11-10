// src/app/layout.tsx
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://webarastudio.com'),
  title: {
    default: 'Webara Studio | Collaborative Digital Product Studio',
    template: '%s | Webara Studio',
  },
  description:
    'Webara Studio partners with ambitious teams to co-create high-converting websites and digital products with transparent pricing, shared innovation, and enterprise-level quality.',
  keywords: [
    'Webara Studio',
    'web development agency',
    'SaaS product design',
    'Next.js experts',
    'React development',
    'B2B landing pages',
    'startup product studio',
    'collaborative product development',
  ],
  authors: [{ name: 'Webara Studio', url: 'https://webarastudio.com' }],
  creator: 'Webara Studio',
  publisher: 'Webara Studio',
  openGraph: {
    type: 'website',
    url: 'https://webarastudio.com',
    title: 'Webara Studio | Collaborative Digital Product Studio',
    description:
      'Co-create modern, performant web apps and marketing sites. Transparent retainers, shared IP, and results-focused builds.',
    siteName: 'Webara Studio',
    images: [
      {
        url: '/webarabadge.png',
        width: 800,
        height: 420,
        alt: 'Webara Studio - Collaborative Digital Product Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webara Studio | Collaborative Digital Product Studio',
    description:
      'Webara Studio builds high-converting, performant web experiences in partnership with your team.',
    images: ['/webarabadge.png'],
  },
  icons: {
    icon: [
      { url: '/W.png', sizes: 'any', type: 'image/png' },
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
    <ClerkProvider>
      <html lang="en" className="!scroll-smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="font-body antialiased">
          <AppProviders>{children}</AppProviders>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
