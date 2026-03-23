import { NextResponse } from 'next/server';
import { requireAuthenticatedProfile } from '@/lib/auth-server';

export async function POST(
  _req: Request,
  context: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await context.params;

  if (!quoteId) {
    return NextResponse.json(
      { error: 'Quote ID is required.' },
      { status: 400 }
    );
  }

  let userId: string;
  let supabase: Awaited<ReturnType<typeof requireAuthenticatedProfile>>['supabase'];

  try {
    const authContext = await requireAuthenticatedProfile();
    userId = authContext.user.id;
    supabase = authContext.supabase;
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to request a call.' },
      { status: 401 }
    );
  }

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

  if ((quote as any).user_id !== userId) {
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

  const { data: updated, error: updateError } = await supabase
    .from('quotes')
    .update({ status: 'call_requested' } as never)
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
