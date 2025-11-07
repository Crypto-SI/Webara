// src/components/logo.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/contexts/animation-context';

type LogoVariant = 'light' | 'dark';

const logoByVariant: Record<LogoVariant, string> = {
  light: '/webaralogo.png',
  dark: '/webaralogolight.png',
};

export function Logo({
  className,
  variant = 'dark',
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  const { playAnimation } = useAnimation();
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      playAnimation();
    }
  };

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className={cn('flex items-center', className)}
      prefetch={false}
    >
      <Image
        src={logoByVariant[variant]}
        alt="Webara Studio"
        width={160}
        height={42}
        className="h-8 w-auto md:h-10"
      />
    </Link>
  );
}
