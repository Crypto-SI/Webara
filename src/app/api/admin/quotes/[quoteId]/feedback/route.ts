import { NextResponse } from 'next/server';
import { getAdminSupabaseContext } from '@/lib/admin-auth';

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

  let payload: { feedback?: unknown } = {};

  try {
    payload = (await request.json()) as { feedback?: unknown };
  } catch (error) {
    console.error('Invalid feedback payload:', error);
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

  const normalizedFeedback =
    typeof feedbackValue === 'string'
      ? feedbackValue.trim()
      : feedbackValue ?? null;

  const { data: updatedQuote, error: updateError } = await admin.supabase
    .from('quotes')
    .update({
      admin_feedback:
        normalizedFeedback && normalizedFeedback.length > 0
          ? normalizedFeedback
          : null,
    } as never)
    .eq('id', quoteId)
    .select('*')
    .maybeSingle();

  if (updateError) {
    console.error('Failed to update admin feedback:', updateError);
    return NextResponse.json(
      { error: 'Failed to save feedback.' },
      { status: 500 }
    );
  }

  if (!updatedQuote) {
    return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
  }

  return NextResponse.json({ quote: updatedQuote });
}
