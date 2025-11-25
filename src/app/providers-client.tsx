'use client';

import type { PropsWithChildren } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { AppProviders } from './providers';

const marketingPrefixes = [
  '/',
  '/blog',
  '/case-studies',
  '/services',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service',
];

/**
 * Wraps the app with shared client providers and conditionally loads Clerk
 * only on authenticated surfaces. This keeps Clerk/auth bundles out of the
 * public marketing pages to reduce unused JS.
 */
export function ClientProviders({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isMarketingRoute =
    pathname === '/' ||
    marketingPrefixes
      .filter((prefix) => prefix !== '/')
      .some((prefix) => pathname?.startsWith(prefix));
  const shouldEnableClerk = !isMarketingRoute;

  if (!shouldEnableClerk) {
    return <AppProviders enableAuthProviders={false}>{children}</AppProviders>;
  }

  return (
    <ClerkProvider
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/login'}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/signup'}
      afterSignInUrl={
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/profile'
      }
      afterSignUpUrl={
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/profile'
      }
    >
      <AppProviders>{children}</AppProviders>
    </ClerkProvider>
  );
}
