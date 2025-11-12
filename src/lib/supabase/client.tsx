'use client';

import { useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export function useSupabaseClient(): SupabaseClient<Database> {
  const { session } = useSession();

  return useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
      );
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      accessToken: async () => session?.getToken() ?? null,
    });
  }, [session]);
}
