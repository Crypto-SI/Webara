import { NextResponse } from 'next/server';
import { requireAdminProfile } from '@/lib/auth-server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export type SupabaseServerClient = ReturnType<typeof createAdminSupabaseClient>;

type AdminContext =
  | {
      supabase: SupabaseServerClient;
      userId: string;
      role: string;
    }
  | {
      errorResponse: NextResponse;
    };

export async function getAdminSupabaseContext(): Promise<AdminContext> {
  try {
    const { user, profile, supabase } = await requireAdminProfile();
    return {
      supabase,
      userId: user.id,
      role: profile.role,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';

    if (message === 'Unauthorized') {
      return {
        errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    if (message === 'Forbidden') {
      return {
        errorResponse: NextResponse.json({ error: 'Forbidden (admin only)' }, { status: 403 }),
      };
    }

    return {
      errorResponse: NextResponse.json(
        { error: 'Unable to verify admin privileges.' },
        { status: 500 }
      ),
    };
  }
}
