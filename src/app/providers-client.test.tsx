import React, { type PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { ClientProviders } from './providers-client';

const mockClerkProvider = vi.fn(
  ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="clerk-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )
);

vi.mock('@clerk/nextjs', () => {
  const mockUseUser = () => ({ user: null, isLoaded: true, isSignedIn: false });
  const mockUseSession = () => ({ session: null, isLoaded: true });
  const mockUseClerk = () => ({
    signOut: vi.fn(),
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
  });

  return {
    ClerkProvider: (props: PropsWithChildren<Record<string, unknown>>) =>
      mockClerkProvider(props),
    useUser: mockUseUser,
    useSession: mockUseSession,
    useClerk: mockUseClerk,
    SignedIn: ({ children }: PropsWithChildren) => <>{children}</>,
    SignedOut: ({ children }: PropsWithChildren) => <>{children}</>,
    SignInButton: ({ children }: PropsWithChildren) => <>{children}</>,
    SignUpButton: ({ children }: PropsWithChildren) => <>{children}</>,
  };
});

describe('ClientProviders', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    mockClerkProvider.mockClear();
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
    delete process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
    delete process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('wraps children with ClerkProvider', () => {
    render(
      <ClientProviders>
        <div data-testid="child" />
      </ClientProviders>
    );

    expect(screen.getByTestId('clerk-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(mockClerkProvider).toHaveBeenCalledTimes(1);
  });

  it('uses default auth URLs when env vars are missing', () => {
    render(
      <ClientProviders>
        <div />
      </ClientProviders>
    );

    const props = mockClerkProvider.mock.calls[0]?.[0];
    expect(props).toMatchObject({
      signInUrl: '/login',
      signUpUrl: '/signup',
      afterSignInUrl: '/profile',
      afterSignUpUrl: '/profile',
    });
  });

  it('respects Clerk URL env overrides', () => {
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/custom-login';
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL = '/custom-signup';
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = '/dashboard';
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = '/welcome';

    render(
      <ClientProviders>
        <div />
      </ClientProviders>
    );

    const props = mockClerkProvider.mock.calls[0]?.[0];
    expect(props).toMatchObject({
      signInUrl: '/custom-login',
      signUpUrl: '/custom-signup',
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/welcome',
    });
  });
});
