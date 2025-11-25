'use client';

// src/app/page.tsx
import { MarketingHeader } from '@/components/layout/marketing-header';
import { HeroSection } from '@/components/sections/hero-section';
import { HowItWorksSection } from '@/components/sections/how-it-works-section';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { AboutSection } from '@/components/sections/about-section';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/layout/footer';
import { IntroAnimation } from '@/components/intro-animation';
import { useAnimation } from '@/contexts/animation-context';

const TestimonialsSection = dynamic(
  () =>
    import('@/components/sections/testimonials-section').then(
      (mod) => mod.TestimonialsSection
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading testimonials…
      </div>
    ),
  }
);

const QuoteSection = dynamic(
  () =>
    import('@/components/sections/quote-section').then(
      (mod) => mod.QuoteSection
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading quote form…
      </div>
    ),
  }
);

// NOTE: metadata export removed because this is now a client component.
// Move SEO metadata into a server layout (e.g. src/app/(marketing)/layout.tsx) instead.

// JSON-LD Organization schema for enhanced rich results
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Webara Studio',
  url: 'https://webarastudio.com',
  logo: 'https://webarastudio.com/webaralogo.webp',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@webarastudio.com',
      availableLanguage: ['en'],
    },
  ],
};

export default function Home() {
  const { isAnimationVisible } = useAnimation();
  return (
    <>
      {/* Organization JSON-LD for rich results */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {isAnimationVisible && <IntroAnimation />}
      <div className="page-shell">
        <MarketingHeader />
        <main className="page-main">
          <section className="section-px">
            <HeroSection />
          </section>
          <section className="section-px">
            <HowItWorksSection />
          </section>
          <section className="section-px" id="portfolio">
            <PortfolioSection />
          </section>
          <section className="section-px">
            <AboutSection />
          </section>
          <section className="section-px">
            <TestimonialsSection />
          </section>
          <section className="section-px" id="contact">
            <QuoteSection />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
