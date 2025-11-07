import { createBrowserClient } from '@supabase/ssr';
import { useSession } from '@clerk/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

let client: SupabaseClient<Database> | undefined;

export function createSupabaseClient() {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    }

    client = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      accessToken: async () => {
        // Get Clerk session token
        const { session } = useSession();
        return session?.getToken() ?? null;
      },
    });
  }

  return client;
}
