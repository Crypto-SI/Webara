'use client';

import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface AuthState {
  user: any | null;
  loading: boolean;
  profile: any | null;
}

export function useClerkSupabaseAuth() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!isLoaded || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userId = user.id;

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    loadProfile();
  }, [user, isLoaded, supabase]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
  };
}
