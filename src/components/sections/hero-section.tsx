'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            <span className="text-accent">WE BUILD</span> DIGITAL EXPERIENCES
          </h1>
          <p className="max-w-[600px] text-foreground/80 md:text-xl">
            From stunning websites to intuitive mobile apps, we craft digital
            solutions that captivate your audience and drive results. Let's
            build something amazing together.
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
            <div className="relative w-full max-w-lg overflow-hidden rounded-lg shadow-2xl transition-transform duration-300 group-hover:rotate-0 lg:rotate-3">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={800}
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
