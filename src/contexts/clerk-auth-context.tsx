'use client';

import { useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface AuthState {
  user: any | null;
  loading: boolean;
  profile: any | null;
}

export function useClerkSupabaseAuth() {
  const { user, isLoaded } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (!isLoaded || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    loadProfile();
  }, [user, isLoaded]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
  };
}