import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export async function PATCH(
  request: Request,
  { params }: { params: { quoteId: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { quoteId } = params;
  const { userId } = await auth();

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

  const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  type QuoteRow = Database['public']['Tables']['quotes']['Row'];

  // Ensure the quote belongs to the authenticated user
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
    })
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