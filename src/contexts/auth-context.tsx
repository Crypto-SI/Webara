'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: any | null;
  loading: boolean;
  profile: ProfileRow | null;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any | null; needsEmailVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const supabase = createSupabaseClient();

  const loadProfile = useCallback(
    async (user: any | null) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      setLoading(true);

      try {
        // Get Clerk user ID from user.id
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
          // Check if user has admin role from metadata
          const hasAdminRole = user.publicMetadata?.role === 'admin' || user.publicMetadata?.role === 'webara_staff';
          setIsAdmin(hasAdminRole || false);
        }
      } catch (error) {
        console.error('Unexpected error in loadProfile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    },
    [user, isLoaded]
  );

  const signUp = async (email: string, password: string, metadata?: any) => {
    // This would be handled by Clerk's SignUp component
    return { error: { message: 'Use Clerk SignUp component instead' } };
  };

  const signIn = async (email: string, password: string) => {
    // This would be handled by Clerk's SignIn component
    return { error: { message: 'Use Clerk SignIn component instead' } };
  };

  const signOut = async () => {
    // This would be handled by Clerk's SignOut button
    return Promise.resolve();
  };

  const updateProfile = async (updates: any) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

      // Refresh profile after update
      await loadProfile(user);
      return { error: null };
    } catch (error) {
      return { error: { message: 'Failed to update profile' } };
    }
  };

  const refreshProfile = async () => {
    await loadProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
