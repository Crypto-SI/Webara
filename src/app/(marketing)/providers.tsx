// Client providers for marketing pages (no auth)
'use client';

import type { PropsWithChildren } from 'react';
import { AnimationProvider } from '@/contexts/animation-context';

export function MarketingProviders({ children }: PropsWithChildren) {
  return <AnimationProvider>{children}</AnimationProvider>;
}
