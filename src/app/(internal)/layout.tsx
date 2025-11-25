import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProviders } from '@/app/providers';

export default function InternalLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <AppProviders>{children}</AppProviders>
    </ClerkProvider>
  );
}
