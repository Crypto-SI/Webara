import { NextResponse } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { getAdminSupabaseContext } from '@/lib/admin-auth';

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
  context: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await context.params;
  const admin = await getAdminSupabaseContext();
  if ('errorResponse' in admin) return admin.errorResponse;

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

  const serviceClient: TypedClient = admin.supabase;

  const { data: updatedQuote, error: updateError } = await serviceClient
    .from('quotes')
    .update({ status: normalizedStatus } as never)
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
