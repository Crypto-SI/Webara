'use client';

// src/app/page.tsx
import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/sections/hero-section';
import { HowItWorksSection } from '@/components/sections/how-it-works-section';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { AboutSection } from '@/components/sections/about-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { QuoteSection } from '@/components/sections/quote-section';
import { Footer } from '@/components/layout/footer';
import { IntroAnimation } from '@/components/intro-animation';
import { useAnimation } from '@/contexts/animation-context';

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
        <Header />
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
