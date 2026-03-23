import { NextResponse } from 'next/server';
import { getAdminSupabaseContext } from '@/lib/admin-auth';

export async function GET() {
  const admin = await getAdminSupabaseContext();
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  const { supabase: serviceClient } = admin;

  const [appsResponse, profilesResponse, businessesResponse, quotesResponse] =
    await Promise.all([
      serviceClient.from('apps').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      serviceClient.from('profiles').select('*'),
      serviceClient.from('businesses').select('*'),
      serviceClient.from('quotes').select('*'),
    ]);

  if (appsResponse.error && !['42P01', 'PGRST205'].includes(appsResponse.error.code ?? '')) {
    console.error('Apps API error:', appsResponse.error);
    return NextResponse.json(
      { error: `Apps API error: ${appsResponse.error.message}` },
      { status: 500 }
    );
  }

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
    apps: appsResponse.data ?? [],
    profiles: profilesResponse.data ?? [],
    businesses: businessesResponse.data ?? [],
    quotes: quotesResponse.data ?? [],
  });
}
