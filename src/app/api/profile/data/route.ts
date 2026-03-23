import { NextResponse } from 'next/server';
import { requireAuthenticatedProfile } from '@/lib/auth-server';

export async function GET() {
  try {
    const { user, profile, supabase } = await requireAuthenticatedProfile();
    const [businessesResponse, quotesResponse] = await Promise.all([
      supabase.from('businesses').select('*').eq('owner_id', user.id),
      supabase.from('quotes').select('*').eq('user_id', user.id),
    ]);

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
        id: user.id,
        email: user.email ?? null,
        fullName:
          (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
          profile?.full_name ||
          null,
        imageUrl:
          (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
          profile?.avatar_url ||
          null,
      },
      profile,
      businesses: businessesResponse.data || [],
      quotes: quotesResponse.data || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
