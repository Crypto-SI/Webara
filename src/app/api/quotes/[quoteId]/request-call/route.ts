import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/quotes/[quoteId]/request-call
// - Auth: must be logged in
// - Ownership: quote.user_id must match current user
// - Guard: quote.admin_feedback must be present
// - Effect: set status = 'call_requested' if not already and return updated quote
export async function POST(
  _req: Request,
  context: { params: { quoteId: string } }
) {
  const quoteId = context.params.quoteId;

  if (!quoteId) {
    return NextResponse.json(
      { error: 'Quote ID is required.' },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to request a call.' },
      { status: 401 }
    );
  }

  // Fetch quote with ownership + admin_feedback check
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('id, user_id, status, admin_feedback')
    .eq('id', quoteId)
    .single<any>();

  if (quoteError || !quote) {
    return NextResponse.json(
      { error: 'Quote not found.' },
      { status: 404 }
    );
  }

  if ((quote as any).user_id !== user.id) {
    return NextResponse.json(
      { error: 'You are not allowed to request a call for this quote.' },
      { status: 403 }
    );
  }

  if (
    !(quote as any).admin_feedback ||
    (quote as any).admin_feedback.trim().length === 0
  ) {
    return NextResponse.json(
      {
        error:
          'A call can only be requested after our team has left feedback on this quote.',
      },
      { status: 400 }
    );
  }

  if ((quote as any).status === 'call_requested') {
    // Idempotent: already requested
    return NextResponse.json(
      {
        quote: {
          ...(quote as any),
          status: 'call_requested',
        } as any,
        message: 'A call has already been requested for this quote.',
      },
      { status: 200 }
    );
  }

  // Update quote.status to call_requested
  // Update via a raw SQL call to avoid TS inference issues with generated types
  const { data: updated, error: updateError } = await supabase
    .from('quotes' as any)
    .update({ status: 'call_requested' } as any)
    .eq('id', quoteId)
    .select('id, user_id, status, admin_feedback')
    .single<any>();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: 'Failed to request a call. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      quote: updated,
      message:
        'Your request has been sent. Our team will call you using the phone number on your account.',
    },
    { status: 200 }
  );
}