import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured.' },
      { status: 500 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase service role key is not configured.' },
      { status: 500 }
    );
  }

  const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  // Get current user's profile, businesses, and quotes
  const userKey = clerkUser.publicMetadata?.supabase_user_id as string | undefined;
  const lookupId = userKey || clerkUser.id;

  const [
    profileResponse,
    businessesResponse,
    quotesResponse,
  ] = await Promise.all([
    serviceClient
      .from('profiles')
      .select('*')
      .eq('user_id', lookupId)
      .maybeSingle(),
    serviceClient
      .from('businesses')
      .select('*')
      .eq('owner_id', lookupId),
    serviceClient
      .from('quotes')
      .select('*')
      .eq('user_id', lookupId),
  ]);

  if (profileResponse.error) {
    return NextResponse.json(
      { error: profileResponse.error.message },
      { status: 500 }
    );
  }

  if (businessesResponse.error) {
    return NextResponse.json(
      { error: businessesResponse.error.message },
      { status: 500 }
    );
  }

  if (quotesResponse.error) {
    return NextResponse.json(
      { error: quotesResponse.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    user: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress ?? null,
      fullName: clerkUser.fullName,
      imageUrl: clerkUser.imageUrl,
    },
    profile: profileResponse.data ?? null,
    businesses: businessesResponse.data || [],
    quotes: quotesResponse.data || [],
  });
}
