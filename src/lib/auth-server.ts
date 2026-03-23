import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

const ADMIN_ROLES = new Set<ProfileRow['role']>(['admin', 'webara_staff']);

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

function deriveRole(user: User, matchingProfiles: ProfileRow[]): ProfileRow['role'] {
  const profileRole = matchingProfiles.find((profile) => ADMIN_ROLES.has(profile.role))?.role;
  if (profileRole) {
    return profileRole;
  }

  return 'user';
}

function deriveFullName(user: User, matchingProfiles: ProfileRow[]) {
  const fromMetadata = [
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
    typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null,
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .trim(),
  ].find((value) => value && value.trim().length > 0);

  if (fromMetadata) {
    return fromMetadata;
  }

  return (
    matchingProfiles.find((profile) => profile.full_name?.trim())?.full_name ??
    null
  );
}

function buildProfilePayload(user: User, matchingProfiles: ProfileRow[]): ProfileInsert {
  const email = normalizeEmail(user.email);
  const existingProfile = matchingProfiles.find((profile) => profile.user_id === user.id) ?? null;
  const firstLegacyProfile = matchingProfiles[0] ?? null;

  return {
    id: existingProfile?.id ?? user.id,
    user_id: user.id,
    clerk_user_id: existingProfile?.clerk_user_id ?? firstLegacyProfile?.clerk_user_id ?? user.id,
    email: email ?? `${user.id}@example.invalid`,
    email_verified: Boolean(user.email_confirmed_at),
    first_name:
      (typeof user.user_metadata?.first_name === 'string' && user.user_metadata.first_name) ||
      existingProfile?.first_name ||
      firstLegacyProfile?.first_name ||
      null,
    last_name:
      (typeof user.user_metadata?.last_name === 'string' && user.user_metadata.last_name) ||
      existingProfile?.last_name ||
      firstLegacyProfile?.last_name ||
      null,
    full_name: deriveFullName(user, matchingProfiles),
    username:
      (typeof user.user_metadata?.user_name === 'string' && user.user_metadata.user_name) ||
      (typeof user.user_metadata?.username === 'string' && user.user_metadata.username) ||
      existingProfile?.username ||
      firstLegacyProfile?.username ||
      null,
    phone:
      (typeof user.phone === 'string' && user.phone) ||
      existingProfile?.phone ||
      firstLegacyProfile?.phone ||
      null,
    avatar_url:
      (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
      existingProfile?.avatar_url ||
      firstLegacyProfile?.avatar_url ||
      null,
    role: deriveRole(user, matchingProfiles),
    clerk_created_at: firstLegacyProfile?.clerk_created_at ?? null,
    clerk_last_sign_in_at: firstLegacyProfile?.clerk_last_sign_in_at ?? null,
    public_metadata: existingProfile?.public_metadata ?? firstLegacyProfile?.public_metadata ?? {},
    private_metadata: existingProfile?.private_metadata ?? firstLegacyProfile?.private_metadata ?? {},
    unsafe_metadata: existingProfile?.unsafe_metadata ?? firstLegacyProfile?.unsafe_metadata ?? {},
    created_at: existingProfile?.created_at ?? firstLegacyProfile?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function reassignUserReferences(admin: AdminClient, fromIds: string[], toUserId: string) {
  if (fromIds.length === 0) return;

  const reassignments = [
    {
      label: 'businesses.owner_id',
      table: 'businesses',
      task: () =>
        admin.from('businesses').update({ owner_id: toUserId } as never).in('owner_id', fromIds),
    },
    {
      label: 'quotes.user_id',
      table: 'quotes',
      task: () =>
        admin.from('quotes').update({ user_id: toUserId } as never).in('user_id', fromIds),
    },
    {
      label: 'quote_activities.created_by',
      table: 'quote_activities',
      task: () =>
        admin
          .from('quote_activities')
          .update({ created_by: toUserId } as never)
          .in('created_by', fromIds),
    },
    {
      label: 'projects.client_id',
      table: 'projects',
      task: () =>
        admin.from('projects').update({ client_id: toUserId } as never).in('client_id', fromIds),
    },
    {
      label: 'audit_logs.user_id',
      table: 'audit_logs',
      task: () =>
        admin.from('audit_logs').update({ user_id: toUserId } as never).in('user_id', fromIds),
    },
    {
      label: 'weekly_marketing_checklist_items.updated_by',
      table: 'weekly_marketing_checklist_items',
      task: () =>
        admin
          .from('weekly_marketing_checklist_items')
          .update({ updated_by: toUserId } as never)
          .in('updated_by', fromIds),
    },
    {
      label: 'weekly_marketing_summaries.committed_by',
      table: 'weekly_marketing_summaries',
      task: () =>
        admin
          .from('weekly_marketing_summaries')
          .update({ committed_by: toUserId } as never)
          .in('committed_by', fromIds),
    },
  ];

  const results = await Promise.all(
    reassignments.map(async ({ label, task, table }) => ({ label, table, result: await task() }))
  );

  const failed = results.find(
    ({ result }) => result.error && !['42P01', 'PGRST205'].includes(result.error.code ?? '')
  );
  if (failed?.result.error) {
    throw new Error(
      `Failed to reassign legacy user references for ${failed.label}: ${failed.result.error.message}`
    );
  }
}

async function retireDuplicateProfiles(admin: AdminClient, duplicates: ProfileRow[]) {
  if (duplicates.length === 0) return;

  const duplicateIds = duplicates.map((profile) => profile.id);
  const { error } = await admin.from('profiles').delete().in('id', duplicateIds);
  if (error) {
    throw new Error(`Failed to retire duplicate profiles: ${error.message}`);
  }
}

export async function syncProfileForAuthUser(
  user: User,
  admin = createAdminSupabaseClient()
): Promise<ProfileRow> {
  const email = normalizeEmail(user.email);
  const filters = [`user_id.eq.${user.id}`];

  if (email) {
    filters.push(`email.ilike.${email}`);
  }

  const { data: matchingProfiles, error: profilesError } = await admin
    .from('profiles')
    .select('*')
    .or(filters.join(','))
    .order('created_at', { ascending: true });

  if (profilesError) {
    throw new Error(`Failed to load matching profiles: ${profilesError.message}`);
  }

  const profiles = matchingProfiles ?? [];
  const payload = buildProfilePayload(user, profiles);

  const legacyIds = Array.from(
    new Set(
      profiles
        .flatMap((profile) => [profile.user_id, profile.clerk_user_id])
        .filter((value): value is string => Boolean(value) && value !== user.id)
    )
  );

  await reassignUserReferences(admin, legacyIds, user.id);

  const { data: upsertedProfile, error: upsertError } = await admin
    .from('profiles')
    .upsert(payload as never, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (upsertError || !upsertedProfile) {
    throw new Error(upsertError?.message || 'Failed to upsert canonical profile.');
  }

  let canonicalProfile = upsertedProfile;

  if (canonicalProfile.role !== payload.role) {
    const { data: roleAdjustedProfile, error: roleAdjustError } = await admin
      .from('profiles')
      .update({ role: payload.role, updated_at: new Date().toISOString() } as never)
      .eq('id', canonicalProfile.id)
      .select('*')
      .single();

    if (roleAdjustError || !roleAdjustedProfile) {
      throw new Error(roleAdjustError?.message || 'Failed to align canonical profile role.');
    }

    canonicalProfile = roleAdjustedProfile;
  }

  const duplicates = profiles.filter((profile) => profile.id !== canonicalProfile.id);
  await retireDuplicateProfiles(admin, duplicates);

  return canonicalProfile;
}

export async function requireAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAuthenticatedProfile() {
  const user = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const profile = await syncProfileForAuthUser(user, admin);
  return { user, profile, supabase: admin };
}

export async function requireAdminProfile() {
  const context = await requireAuthenticatedProfile();

  if (!ADMIN_ROLES.has(context.profile.role)) {
    throw new Error('Forbidden');
  }

  return context;
}
