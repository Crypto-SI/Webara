import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProviders } from '@/app/providers';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <AppProviders>{children}</AppProviders>
    </ClerkProvider>
  );
}
