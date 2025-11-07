import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/database.types';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables.');
}

if (!clerkSecretKey) {
  throw new Error('Missing CLERK_SECRET_KEY environment variable.');
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

type ClerkUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  image_url?: string | null;
  email_addresses?: { email_address: string; verification?: { status: string } }[];
  phone_numbers?: { phone_number: string }[];
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at?: string;
  last_sign_in_at?: string;
};

const CLERK_API_URL = 'https://api.clerk.com/v1/users';
const BATCH_SIZE = 100;

async function fetchAllClerkUsers() {
  const users: ClerkUser[] = [];
  let offset = 0;

  while (true) {
    const response = await fetch(`${CLERK_API_URL}?limit=${BATCH_SIZE}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch Clerk users: ${response.status} - ${errorBody}`);
    }

    const batch: ClerkUser[] = await response.json();
    users.push(...batch);

    if (batch.length < BATCH_SIZE) {
      break;
    }

    offset += BATCH_SIZE;
  }

  return users;
}

function deriveRole(user: ClerkUser): Database['public']['Tables']['profiles']['Row']['role'] {
  const metadataRole = String(
    user.public_metadata?.role ?? user.private_metadata?.role ?? user.unsafe_metadata?.role ?? 'user'
  ).toLowerCase();

  if (metadataRole === 'admin') return 'admin';
  if (metadataRole === 'webara_staff') return 'webara_staff';
  return 'user';
}

function deriveEmailVerified(user: ClerkUser): boolean {
  const primaryEmail = user.email_addresses?.[0];
  return primaryEmail?.verification?.status === 'verified';
}

function derivePrimaryEmail(user: ClerkUser): string {
  return user.email_addresses?.[0]?.email_address || '';
}

function deriveFullName(user: ClerkUser) {
  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    user.username ||
    user.email_addresses?.[0]?.email_address ||
    'New Webara user'
  );
}

async function syncUsers() {
  console.log('🔄 Fetching users from Clerk...');
  const clerkUsers = await fetchAllClerkUsers();
  console.log(`✅ Retrieved ${clerkUsers.length} Clerk users.`);

  console.log('🔄 Fetching existing profiles from Supabase...');
  const { data: existingProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, clerk_user_id, email, email_verified, first_name, last_name, full_name, username, phone, avatar_url, role, clerk_created_at, clerk_last_sign_in_at, public_metadata, private_metadata, unsafe_metadata');

  if (profileError) {
    throw new Error(`Unable to load profiles: ${profileError.message}`);
  }

  const existingIds = new Set(existingProfiles?.map((profile: any) => profile.clerk_user_id || profile.user_id) ?? []);

  const payload = clerkUsers
    .filter(user => !existingIds.has(user.id))
    .map(user => ({
      // Don't set id - let the database generate it
      user_id: user.id,
      clerk_user_id: user.id,
      email: derivePrimaryEmail(user),
      email_verified: deriveEmailVerified(user),
      first_name: user.first_name ?? null,
      last_name: user.last_name ?? null,
      full_name: deriveFullName(user),
      username: user.username ?? null,
      phone: user.phone_numbers?.[0]?.phone_number ?? null,
      avatar_url: user.image_url ?? null,
      role: deriveRole(user),
      clerk_created_at: user.created_at ? new Date(user.created_at).toISOString() : null,
      clerk_last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at).toISOString() : null,
      public_metadata: user.public_metadata ?? {},
      private_metadata: user.private_metadata ?? {},
      unsafe_metadata: user.unsafe_metadata ?? {},
    })) as any;

  if (payload.length === 0) {
    console.log('🎉 All Clerk users already exist in Supabase. No action needed.');
    return;
  }

  console.log(`🚀 Inserting ${payload.length} missing profiles into Supabase...`);
  const { error: insertError } = await supabase.from('profiles').insert(payload);

  if (insertError) {
    throw new Error(`Failed to insert profiles: ${insertError.message}`);
  }

  console.log('✅ Sync complete!');
}

syncUsers().catch(error => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
