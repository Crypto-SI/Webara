'use client';

import type { PropsWithChildren } from 'react';

import { PwaInit } from '@/components/pwa-init';

import { AppProviders } from './providers';

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <>
      <PwaInit />
      <AppProviders>{children}</AppProviders>
    </>
  );
}
