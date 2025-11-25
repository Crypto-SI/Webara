'use client';

import type { PropsWithChildren } from 'react';
import { AnimationProvider } from '@/contexts/animation-context';
import { SimpleAuthProvider } from '@/contexts/auth-context-simple';

/**
 * Centralized wrapper for all client-side providers.
 * Following the App Router guidelines keeps layout.tsx focused on document structure.
 */
export function AppProviders({
  children,
  enableAuthProviders = true,
}: PropsWithChildren<{ enableAuthProviders?: boolean }>) {
  if (!enableAuthProviders) {
    return <AnimationProvider>{children}</AnimationProvider>;
  }

  return (
    <SimpleAuthProvider>
      <AnimationProvider>{children}</AnimationProvider>
    </SimpleAuthProvider>
  );
}
