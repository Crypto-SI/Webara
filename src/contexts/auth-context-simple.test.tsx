import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SimpleAuthProvider, useSimpleAuth } from './auth-context-simple';

// Shared mock state we can tweak per test
let mockUser: any = null;
let mockSession: any = null;
const mockClerk = {
  openSignIn: vi.fn(),
  openSignUp: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: mockUser, isLoaded: true }),
  useSession: () => ({ session: mockSession, isLoaded: true }),
  useClerk: () => mockClerk,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <SimpleAuthProvider>{children}</SimpleAuthProvider>;
}

describe('SimpleAuthProvider', () => {
  beforeEach(() => {
    mockUser = null;
    mockSession = null;
    mockClerk.openSignIn.mockReset();
    mockClerk.openSignUp.mockReset();
    mockClerk.signOut.mockReset();
  });

  it('exposes derived profile when Clerk user exists', () => {
    mockUser = {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      createdAt: Date.now(),
      lastSignInAt: Date.now(),
      primaryEmailAddress: { emailAddress: 'test@example.com', verification: { status: 'verified' } },
      publicMetadata: { role: 'admin' },
      unsafeMetadata: { role: 'admin' },
      imageUrl: 'https://example.com/avatar.png',
      emailAddresses: [],
    };

    const { result } = renderHook(() => useSimpleAuth(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.user?.id).toBe('user_123');
    expect(result.current.profile?.email).toBe('test@example.com');
    expect(result.current.isAdmin).toBe(true);
  });

  it('calls Clerk signIn/signUp/signOut helpers', async () => {
    const { result } = renderHook(() => useSimpleAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn();
      await result.current.signUp();
      await result.current.signOut();
    });

    expect(mockClerk.openSignIn).toHaveBeenCalledTimes(1);
    expect(mockClerk.openSignUp).toHaveBeenCalledTimes(1);
    expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
  });

  it('returns loading=false and null profile when signed out', () => {
    const { result } = renderHook(() => useSimpleAuth(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });
});
