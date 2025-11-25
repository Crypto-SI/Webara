'use client';

import type { PropsWithChildren } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProviders } from './providers';

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <ClerkProvider>
      <AppProviders>{children}</AppProviders>
    </ClerkProvider>
  );
}
