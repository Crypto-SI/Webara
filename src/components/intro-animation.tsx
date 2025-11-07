// src/components/intro-animation.tsx
'use client';

import Image from 'next/image';
import { useAnimation } from '@/contexts/animation-context';

export function IntroAnimation() {
  const { isFadingOut } = useAnimation();

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-5">
        <div className="animate-spin-slow rounded-full bg-primary/10 p-3 shadow-lg shadow-primary/30">
          <Image
            src="/webarabadgelight.png"
            alt="Webara badge"
            width={64}
            height={64}
            className="h-12 w-12"
          />
        </div>
        <div className="overflow-hidden">
          <Image
            src="/webaralogolight.png"
            alt="Webara Studio"
            width={220}
            height={60}
            className="h-12 w-auto animate-slide-in-right md:h-14"
            priority
          />
        </div>
      </div>
    </div>
  );
}
