import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type TypedClient = SupabaseClient<Database>;
type QuoteRow = Database['public']['Tables']['quotes']['Row'];
type QuoteStatus = QuoteRow['status'];

const ALLOWED_STATUSES: QuoteStatus[] = [
  'draft',
  'pending',
  'under_review',
  'accepted',
  'rejected',
  'call_requested',
  'project_created',
];

type PatchPayload = {
  status?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: { quoteId: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { quoteId } = params;
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

  if (!quoteId) {
    return NextResponse.json(
      { error: 'Quote ID is required.' },
      { status: 400 }
    );
  }

  let payload: PatchPayload = {};

  try {
    payload = (await request.json()) as PatchPayload;
  } catch (error) {
    console.error('Invalid status payload:', error);
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  const newStatus = payload.status;

  if (typeof newStatus !== 'string') {
    return NextResponse.json(
      { error: 'Status is required and must be a string.' },
      { status: 400 }
    );
  }

  const normalizedStatus = newStatus.trim() as QuoteStatus;

  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    return NextResponse.json(
      {
        error: 'Invalid status value.',
        allowed: ALLOWED_STATUSES,
      },
      { status: 400 }
    );
  }

  const serviceClient: TypedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Determine effective role using Clerk metadata then Supabase profiles.
  let effectiveRole: string | null = null;

  try {
    const clerk = await currentUser();
    const metadataRole = String(
      clerk?.publicMetadata?.role ??
        clerk?.privateMetadata?.role ??
        clerk?.unsafeMetadata?.role ??
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
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Unable to verify admin role for status update:', profileError);
      return NextResponse.json(
        { error: 'Unable to verify admin privileges.' },
        { status: 500 }
      );
    }

    // profiles.role is typed in Database, narrow explicitly to avoid 'never'
    if (roleRow && typeof (roleRow as any).role === 'string') {
      effectiveRole = ((roleRow as any).role || '').toLowerCase();
    }
  }

  if (effectiveRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Apply status update
  // Status update (runtime validation above already constrains value).
  // Cast to any to avoid local supabase-js typing issues; runtime is safe.
  const { data: updatedQuote, error: updateError } = await (serviceClient as any)
    .from('quotes')
    .update({ status: normalizedStatus })
    .eq('id', quoteId)
    .select('*')
    .maybeSingle();

  if (updateError) {
    console.error('Failed to update quote status:', updateError);
    return NextResponse.json(
      { error: 'Failed to update quote status.' },
      { status: 500 }
    );
  }

  if (!updatedQuote) {
    return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
  }

  return NextResponse.json({
    quote: updatedQuote,
  });
}