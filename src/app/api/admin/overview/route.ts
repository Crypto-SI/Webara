import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authResponse = await auth();
  const { userId } = authResponse;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured.' },
      { status: 500 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let effectiveRole: string | null = null;

  try {
    const clerkUser = await currentUser();
    const metadataRole = String(
      clerkUser?.publicMetadata?.role ??
        clerkUser?.privateMetadata?.role ??
        clerkUser?.unsafeMetadata?.role ??
        ''
    ).toLowerCase();

    if (metadataRole) {
      effectiveRole = metadataRole;
    }
  } catch (error) {
    console.error('Failed to load Clerk user metadata for role check:', error);
  }

  if (effectiveRole !== 'admin') {
    const { data: roleRow, error: profileError } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle<{ role: string | null }>();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Unable to verify admin role:', profileError);
      return NextResponse.json(
        { error: 'Unable to verify admin privileges.' },
        { status: 500 }
      );
    }

    if (roleRow?.role) {
      effectiveRole = roleRow.role.toLowerCase();
    }
  }

  if (effectiveRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [profilesResponse, businessesResponse, quotesResponse] =
    await Promise.all([
      serviceClient.from('profiles').select('*'),
      serviceClient.from('businesses').select('*'),
      serviceClient.from('quotes').select('*'),
    ]);

  if (profilesResponse.error) {
    console.error('Profiles API error:', profilesResponse.error);
    return NextResponse.json(
      { error: `Profiles API error: ${profilesResponse.error.message}` },
      { status: 500 }
    );
  }

  if (businessesResponse.error) {
    console.error('Businesses API error:', businessesResponse.error);
    return NextResponse.json(
      { error: `Businesses API error: ${businessesResponse.error.message}` },
      { status: 500 }
    );
  }

  if (quotesResponse.error) {
    console.error('Quotes API error:', quotesResponse.error);
    return NextResponse.json(
      { error: `Quotes API error: ${quotesResponse.error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    profiles: profilesResponse.data ?? [],
    businesses: businessesResponse.data ?? [],
    quotes: quotesResponse.data ?? [],
  });
}
