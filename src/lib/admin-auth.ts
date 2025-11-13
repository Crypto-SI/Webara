import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ADMIN_ROLES = new Set(['admin', 'webara_staff']);

export type SupabaseServerClient = ReturnType<typeof createServerSupabaseClient>;
type SupabaseClient = SupabaseServerClient;

type AdminContext =
  | {
      supabase: SupabaseClient;
      userId: string;
      role: string;
    }
  | {
      errorResponse: NextResponse;
    };

export async function getAdminSupabaseContext(): Promise<AdminContext> {
  const { userId } = await auth();

  if (!userId) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const supabase = createServerSupabaseClient();

  const effectiveRole =
    (await resolveClerkRole()) ??
    (await resolveProfileRole(supabase, userId).catch((error) => {
      console.error('Weekly tracker: failed to load profile role', error);
      return '__error__';
    }));

  if (effectiveRole === '__error__') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unable to verify admin privileges.' },
        { status: 500 }
      ),
    };
  }

  if (!isAdminRole(effectiveRole)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden (admin only)' },
        { status: 403 }
      ),
    };
  }

  return { supabase, userId, role: effectiveRole };
}

async function resolveClerkRole(): Promise<string | null> {
  try {
    const clerkUser = await currentUser();
    const rawRole =
      clerkUser?.publicMetadata?.role ??
      clerkUser?.privateMetadata?.role ??
      clerkUser?.unsafeMetadata?.role ??
      null;

    return normalizeRole(rawRole);
  } catch (error) {
    console.warn('Weekly tracker: unable to read Clerk metadata', error);
    return null;
  }
}

async function resolveProfileRole(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  for (const column of ['clerk_user_id', 'user_id'] as const) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq(column, userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data?.role) {
      return normalizeRole(data.role);
    }
  }

  return null;
}

function normalizeRole(role: unknown): string | null {
  if (!role) return null;
  const normalized = String(role).toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function isAdminRole(role: unknown): role is string {
  if (!role) return false;
  return ADMIN_ROLES.has(String(role).toLowerCase());
}
