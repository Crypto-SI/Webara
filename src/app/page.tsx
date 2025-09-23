import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/sections/hero-section';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { AboutSection } from '@/components/sections/about-section';
import { QuoteSection } from '@/components/sections/quote-section';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <PortfolioSection />
        <AboutSection />
        <QuoteSection />
      </main>
      <Footer />
    </div>
  );
}
