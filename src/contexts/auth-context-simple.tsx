'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@/lib/supabase/client';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface SimpleAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileRow | null;
  isAdmin: boolean;
}

interface SimpleAuthContextType extends SimpleAuthState {
  signUp: (
    email?: string,
    password?: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ error: Error | null; needsEmailVerification?: boolean }>;
  signIn: (
    email?: string,
    password?: string
  ) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

async function syncProfileWithSession(accessToken?: string | null, retries = 1) {
  const response = await fetch('/api/auth/profile-sync', {
    method: 'POST',
    cache: 'no-store',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (response.ok) {
    const body = (await response.json()) as { profile: ProfileRow | null };
    return body.profile ?? null;
  }

  const body = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  const message = body?.error || 'Failed to sync profile.';

  // Supabase SSR cookies can lag briefly behind the browser session after auth changes.
  if (retries > 0 && message === 'Unauthorized') {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return syncProfileWithSession(accessToken, retries - 1);
  }

  throw new Error(message);
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !currentUser) {
      setUser(null);
      setProfile(null);
      return;
    }

    setUser(currentUser);
    const nextProfile = await syncProfileWithSession(session?.access_token);
    setProfile(nextProfile);
  }, [session?.access_token, supabase]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const [
          {
            data: { session: nextSession },
          },
          {
            data: { user: nextUser },
          },
        ] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

        if (!mounted) return;

        setSession(nextSession);
        setUser(nextUser ?? null);

        if (nextUser) {
          const nextProfile = await syncProfileWithSession(nextSession?.access_token);
          if (mounted) {
            setProfile(nextProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to initialize auth state:', error);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      void (async () => {
        if (!nextSession?.user) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        try {
          const nextProfile = await syncProfileWithSession(nextSession.access_token);
          if (mounted) {
            setProfile(nextProfile);
          }
        } catch (error) {
          if (mounted) {
            console.error('Failed to refresh profile after auth change:', error);
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isAdmin =
    profile?.role === 'admin' || profile?.role === 'webara_staff';

  const value = useMemo<SimpleAuthContextType>(
    () => ({
      user,
      session,
      loading,
      profile,
      isAdmin,
      signIn: async (email, password) => {
        if (!email || !password) {
          return { error: new Error('Email and password are required.'), session: null };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        return { error: error ?? null, session: data.session ?? null };
      },
      signUp: async (email, password, metadata) => {
        if (!email || !password) {
          return { error: new Error('Email and password are required.') };
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: metadata ? { data: metadata } : undefined,
        });

        return {
          error: error ?? null,
          needsEmailVerification: Boolean(data.user && !data.session),
        };
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        setUser(null);
        setSession(null);
        setProfile(null);
      },
      refreshProfile,
    }),
    [isAdmin, loading, profile, refreshProfile, session, supabase, user]
  );

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export default SimpleAuthProvider;
