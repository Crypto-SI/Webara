'use client';

import type { PropsWithChildren } from 'react';
import { AppProviders } from './providers';
import { PwaInit } from '@/components/pwa-init';

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <>
      <PwaInit />
      <AppProviders>{children}</AppProviders>
    </>
  );
}
