// src/components/intro-animation.tsx
'use client';

import { Cog } from 'lucide-react';
import { useAnimation } from '@/context/animation-context';

export function IntroAnimation() {
  const { isFadingOut } = useAnimation();

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="animate-spin-slow">
          <Cog className="h-12 w-12 text-primary" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground animate-slide-in-right">
            <span className="text-accent">We</span>bara Studio
          </h1>
        </div>
      </div>
    </div>
  );
}
