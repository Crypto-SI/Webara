// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://webarastudio.com'),
  title: {
    default: 'Webara Studio | SaaS & B2B Product Partner',
    template: '%s | Webara Studio',
  },
  description:
    'Webara Studio co-builds SaaS and B2B products with transparent retainers, shared IP, and enterprise delivery—launch faster with a partner who ships.',
  alternates: {
    canonical: 'https://webarastudio.com',
  },
  robots: {
    index: true,
    follow: true,
  },
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
    title: 'Webara Studio | SaaS & B2B Product Partner',
    description:
      'Co-create modern, performant web apps and marketing sites. Transparent retainers, shared IP, and results-focused builds.',
    siteName: 'Webara Studio',
    images: [
      {
        url: '/webarabadge.webp',
        width: 1200,
        height: 630,
        alt: 'Webara Studio - Collaborative Digital Product Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webara Studio | SaaS & B2B Product Partner',
    description:
      'Webara Studio builds high-converting, performant web experiences in partnership with your team.',
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
    <html lang="en" className={`!scroll-smooth ${poppins.variable}`}>
      <head />
      <body className={`font-body antialiased ${poppins.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
