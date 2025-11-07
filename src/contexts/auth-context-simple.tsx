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
      (user.privateMetadata?.role as ProfileRow['role'] | undefined)) || 'user';

  const createdAt =
    typeof user.createdAt === 'number'
      ? new Date(user.createdAt).toISOString()
      : new Date().toISOString();

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null;

  return {
    id: user.id,
    user_id: user.id,
    full_name: user.fullName || primaryEmail,
    phone: null,
    avatar_url: user.imageUrl,
    role,
    created_at: createdAt,
    updated_at: new Date().toISOString(),
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

  const profile = useMemo(() => deriveProfile(user), [user]);
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
