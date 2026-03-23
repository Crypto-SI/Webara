import { NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { requireAuthenticatedProfile } from '@/lib/auth-server';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await context.params;

  let userId: string;
  let serviceClient: ReturnType<typeof createAdminSupabaseClient>;

  try {
    const authContext = await requireAuthenticatedProfile();
    userId = authContext.user.id;
    serviceClient = authContext.supabase;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!quoteId) {
    return NextResponse.json(
      { error: 'Quote ID is required.' },
      { status: 400 }
    );
  }

  let payload: { feedback?: unknown } = {};

  try {
    payload = (await request.json()) as { feedback?: unknown };
  } catch (error) {
    console.error('Invalid user feedback payload:', error);
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  const feedbackValue = payload.feedback;
  if (
    feedbackValue !== null &&
    feedbackValue !== undefined &&
    typeof feedbackValue !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Feedback must be a string or null.' },
      { status: 400 }
    );
  }

  type QuoteRow = Database['public']['Tables']['quotes']['Row'];

  const { data: quote, error: quoteError } = await serviceClient
    .from('quotes')
    .select('id, user_id')
    .eq('id', quoteId)
    .maybeSingle<Pick<QuoteRow, 'id' | 'user_id'>>();

  if (quoteError) {
    console.error('Failed to load quote for ownership check:', quoteError);
    return NextResponse.json(
      { error: 'Failed to verify quote ownership.' },
      { status: 500 }
    );
  }

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
  }

  if (quote.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const normalizedFeedback =
    typeof feedbackValue === 'string'
      ? feedbackValue.trim()
      : feedbackValue ?? null;

  const { data: updatedQuote, error: updateError } = await serviceClient
    .from('quotes')
    .update({
      user_feedback:
        normalizedFeedback && normalizedFeedback.length > 0
          ? normalizedFeedback
          : null,
    } as never)
    .eq('id', quoteId)
    .select('*')
    .maybeSingle<QuoteRow>();

  if (updateError) {
    console.error('Failed to update user feedback:', updateError);
    return NextResponse.json(
      { error: 'Failed to save feedback.' },
      { status: 500 }
    );
  }

  if (!updatedQuote) {
    return NextResponse.json({ error: 'Quote not found after update.' }, { status: 404 });
  }

  return NextResponse.json({ quote: updatedQuote });
}
