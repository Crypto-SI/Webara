// src/app/page.tsx
'use client';
import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/sections/hero-section';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { AboutSection } from '@/components/sections/about-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { QuoteSection } from '@/components/sections/quote-section';
import { Footer } from '@/components/layout/footer';
import { IntroAnimation } from '@/components/intro-animation';
import { useAnimation } from '@/context/animation-context';

export default function Home() {
    const { isAnimationVisible } = useAnimation();
  return (
    <>
    {isAnimationVisible && <IntroAnimation />}
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <PortfolioSection />
        <AboutSection />
        <TestimonialsSection />
        <QuoteSection />
      </main>
      <Footer />
    </div>
    </>
  );
}
