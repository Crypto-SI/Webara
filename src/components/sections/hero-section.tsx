'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TypingAnimation } from '@/components/typing-animation';

export function HeroSection() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-image');

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full py-24 md:py-32 lg:py-40">
      <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center justify-center space-y-6 text-center lg:items-start lg:text-left">
          <TypingAnimation
            className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline"
            parts={[
              { text: 'BUILD SMARTER, ', className: 'text-accent' },
              { text: 'TOGETHER' },
            ]}
          />
          <p className="max-w-[600px] text-foreground/80 md:text-xl">
            Join our partner network to co-create cutting-edge digital products at a fraction of the cost, with shared innovation, transparent pricing, and enterprise-level quality.
          </p>
          <div className="flex flex-col gap-4 min-[400px]:flex-row">
            <Link href="#contact" onClick={(e) => handleScroll(e, '#contact')}>
              <Button size="lg">Start a Project</Button>
            </Link>
            <Link
              href="#portfolio"
              onClick={(e) => handleScroll(e, '#portfolio')}
            >
              <Button size="lg" variant="secondary">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
        <div className="group flex items-center justify-center">
          {heroImage && (
            <div className="relative w-full max-w-lg overflow-hidden rounded-lg shadow-2xl transition-transform duration-300 group-hover:rotate-0 lg:-rotate-3">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={800}
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
              <Image
                src="/webarabadgelight.png"
                alt="Webara mark"
                width={120}
                height={120}
                className="pointer-events-none absolute -left-8 -top-8 hidden h-28 w-28 -rotate-6 select-none drop-shadow-2xl sm:block"
              />
              <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-3 rounded-full bg-foreground/95 px-4 py-2 text-background shadow-lg shadow-primary/20">
                <Image
                  src="/webarabadge.png"
                  alt="Webara badge"
                  width={44}
                  height={44}
                  className="h-10 w-10"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Trusted Studio
                </span>
              </div>
              <div className="pointer-events-none absolute top-4 right-6 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-accent text-background text-center shadow-2xl shadow-accent/40 ring-4 ring-background/80">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                  Up To
                </span>
                <span className="text-2xl font-extrabold leading-none">
                  100%
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                  Off Builds
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
