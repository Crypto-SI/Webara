import { config as loadEnv } from 'dotenv';
import { createClient, type User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

loadEnv({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

const ADMIN_ROLES = new Set<ProfileRow['role']>(['admin', 'webara_staff']);

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

function deriveRole(user: User, profiles: ProfileRow[]): ProfileRow['role'] {
  const existingAdminRole = profiles.find((profile) => ADMIN_ROLES.has(profile.role))?.role;
  if (existingAdminRole) {
    return existingAdminRole;
  }

  const metadataRole = String(user.user_metadata?.role ?? '').toLowerCase();
  if (metadataRole === 'admin' || metadataRole === 'webara_staff') {
    return metadataRole;
  }

  return 'user';
}

function deriveFullName(user: User, profiles: ProfileRow[]) {
  const metadataFullName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    null;

  if (metadataFullName) {
    return metadataFullName;
  }

  return profiles.find((profile) => profile.full_name?.trim())?.full_name ?? null;
}

function buildProfilePayload(user: User, profiles: ProfileRow[]): ProfileInsert {
  const email = normalizeEmail(user.email);
  const canonicalProfile = profiles.find((profile) => profile.user_id === user.id) ?? null;
  const firstLegacyProfile = profiles[0] ?? null;

  return {
    id: canonicalProfile?.id ?? user.id,
    user_id: user.id,
    clerk_user_id:
      canonicalProfile?.clerk_user_id ??
      firstLegacyProfile?.clerk_user_id ??
      user.id,
    email: email ?? `${user.id}@example.invalid`,
    email_verified: Boolean(user.email_confirmed_at),
    first_name:
      (typeof user.user_metadata?.first_name === 'string' && user.user_metadata.first_name) ||
      canonicalProfile?.first_name ||
      firstLegacyProfile?.first_name ||
      null,
    last_name:
      (typeof user.user_metadata?.last_name === 'string' && user.user_metadata.last_name) ||
      canonicalProfile?.last_name ||
      firstLegacyProfile?.last_name ||
      null,
    full_name: deriveFullName(user, profiles),
    username:
      (typeof user.user_metadata?.username === 'string' && user.user_metadata.username) ||
      canonicalProfile?.username ||
      firstLegacyProfile?.username ||
      null,
    phone: canonicalProfile?.phone ?? firstLegacyProfile?.phone ?? null,
    avatar_url:
      (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
      canonicalProfile?.avatar_url ||
      firstLegacyProfile?.avatar_url ||
      null,
    role: deriveRole(user, profiles),
    clerk_created_at: firstLegacyProfile?.clerk_created_at ?? null,
    clerk_last_sign_in_at: firstLegacyProfile?.clerk_last_sign_in_at ?? null,
    public_metadata: canonicalProfile?.public_metadata ?? firstLegacyProfile?.public_metadata ?? {},
    private_metadata:
      canonicalProfile?.private_metadata ?? firstLegacyProfile?.private_metadata ?? {},
    unsafe_metadata: canonicalProfile?.unsafe_metadata ?? firstLegacyProfile?.unsafe_metadata ?? {},
    created_at:
      canonicalProfile?.created_at ??
      firstLegacyProfile?.created_at ??
      new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function reassignUserReferences(fromIds: string[], toUserId: string) {
  if (fromIds.length === 0) return;

  await Promise.all([
    supabase.from('businesses').update({ owner_id: toUserId } as never).in('owner_id', fromIds),
    supabase.from('quotes').update({ user_id: toUserId } as never).in('user_id', fromIds),
    supabase
      .from('quote_activities')
      .update({ created_by: toUserId } as never)
      .in('created_by', fromIds),
    supabase.from('projects').update({ client_id: toUserId } as never).in('client_id', fromIds),
    supabase.from('audit_logs').update({ user_id: toUserId } as never).in('user_id', fromIds),
    supabase
      .from('weekly_marketing_checklist_items')
      .update({ updated_by: toUserId } as never)
      .in('updated_by', fromIds),
    supabase
      .from('weekly_marketing_summaries')
      .update({ committed_by: toUserId } as never)
      .in('committed_by', fromIds),
  ]);
}

async function migrateUser(user: User) {
  const email = normalizeEmail(user.email);
  const filters = [`user_id.eq.${user.id}`];
  if (email) {
    filters.push(`email.ilike.${email}`);
  }

  const { data: matchingProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .or(filters.join(','))
    .order('created_at', { ascending: true });

  if (profilesError) {
    throw new Error(`Failed to load profiles for ${user.email}: ${profilesError.message}`);
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

  await reassignUserReferences(legacyIds, user.id);

  const { data: canonicalProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert(payload as never, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (upsertError || !canonicalProfile) {
    throw new Error(upsertError?.message || `Failed to upsert profile for ${user.email}`);
  }

  let finalProfile = canonicalProfile;

  if (finalProfile.role !== payload.role) {
    const { data: roleAdjustedProfile, error: roleAdjustError } = await supabase
      .from('profiles')
      .update({ role: payload.role, updated_at: new Date().toISOString() } as never)
      .eq('id', finalProfile.id)
      .select('*')
      .single();

    if (roleAdjustError || !roleAdjustedProfile) {
      throw new Error(
        roleAdjustError?.message || `Failed to align profile role for ${user.email}`
      );
    }

    finalProfile = roleAdjustedProfile;
  }

  const duplicates = profiles.filter((profile) => profile.id !== finalProfile.id);
  if (duplicates.length > 0) {
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .in('id', duplicates.map((profile) => profile.id));

    if (deleteError) {
      throw new Error(
        `Failed to delete duplicate profiles for ${user.email}: ${deleteError.message}`
      );
    }
  }

  return {
    email: user.email,
    userId: user.id,
    migratedLegacyIds: legacyIds,
    deletedProfiles: duplicates.map((profile) => profile.id),
    canonicalProfileId: finalProfile.id,
    role: finalProfile.role,
  };
}

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const users = (data.users ?? []).filter((user) => Boolean(user.email));
  const results = [];

  for (const user of users) {
    results.push(await migrateUser(user));
  }

  console.log(JSON.stringify({ migratedUsers: results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
