'use client';

import { createContext, useContext, useMemo } from 'react';
import { useClerk, useSession, useUser } from '@clerk/nextjs';
import type { SessionResource, UserResource } from '@clerk/types';
import type { Database } from '@/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface SimpleAuthState {
  user: UserResource | null;
  session: SessionResource | null;
  loading: boolean;
  profile: ProfileRow | null;
  isAdmin: boolean;
}

interface SimpleAuthContextType extends SimpleAuthState {
  signUp: (email?: string, password?: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email?: string, password?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

function deriveProfile(user: UserResource | null): ProfileRow | null {
  if (!user) return null;

  const role =
    ((user.publicMetadata?.role as ProfileRow['role'] | undefined) ??
      (user.unsafeMetadata?.role as ProfileRow['role'] | undefined)) ||
    'user';

  const createdAt =
    typeof user.createdAt === 'number'
      ? new Date(user.createdAt).toISOString()
      : new Date().toISOString();

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null;

  const toIsoString = (value: number | string | Date | null | undefined) => {
    if (value === null || value === undefined) return null;
    const dateValue =
      typeof value === 'number' || typeof value === 'string'
        ? new Date(value)
        : value;
    return Number.isNaN(dateValue.getTime()) ? null : dateValue.toISOString();
  };

  const emailVerified =
    (user.primaryEmailAddress?.verification?.status ||
      user.emailAddresses?.[0]?.verification?.status) === 'verified';

  const clerkCreatedAt = toIsoString(user.createdAt);
  const clerkLastSignInAt = toIsoString(user.lastSignInAt);

  const nowIso = new Date().toISOString();

  return {
    id: user.id,
    user_id: user.id,
    clerk_user_id: user.id,
    email: primaryEmail || '',
    email_verified: emailVerified,
    first_name: user.firstName ?? null,
    last_name: user.lastName ?? null,
    full_name: user.fullName || primaryEmail,
    username: user.username ?? null,
    phone: user.primaryPhoneNumber?.phoneNumber ?? null,
    avatar_url: user.imageUrl,
    role,
    created_at: createdAt,
    updated_at: nowIso,
    clerk_created_at: clerkCreatedAt,
    clerk_last_sign_in_at: clerkLastSignInAt,
    public_metadata: (user.publicMetadata ?? {}) as ProfileRow['public_metadata'],
    private_metadata: null,
    unsafe_metadata: (user.unsafeMetadata ?? {}) as ProfileRow['unsafe_metadata'],
  };
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const clerk = useClerk();

  const profile = useMemo(() => deriveProfile(user ?? null), [user]);
  const isAdmin =
    profile?.role === 'admin' || profile?.role === 'webara_staff';

  const value = useMemo<SimpleAuthContextType>(() => {
    const loading = !isUserLoaded || !isSessionLoaded;

    return {
      user: user ?? null,
      session: session ?? null,
      loading,
      profile,
      isAdmin,
      signIn: async () => {
        await clerk.openSignIn();
        return { error: null };
      },
      signUp: async () => {
        await clerk.openSignUp();
        return { error: null };
      },
      signOut: async () => {
        await clerk.signOut();
      },
      refreshProfile: async () => {
        // Clerk manages profile data; nothing to refresh locally yet.
        return;
      },
    };
  }, [clerk, isAdmin, isSessionLoaded, isUserLoaded, profile, session, user]);

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export default SimpleAuthProvider;
