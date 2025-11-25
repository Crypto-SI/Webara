'use client';

import type { PropsWithChildren } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProviders } from './providers';

/**
 * Wraps the entire app with Clerk + other client providers.
 * Rendering ClerkProvider unconditionally avoids hook errors from nested providers.
 */
export function ClientProviders({ children }: PropsWithChildren) {
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
