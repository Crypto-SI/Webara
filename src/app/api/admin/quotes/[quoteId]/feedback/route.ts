import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

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
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Unable to verify admin role:', profileError);
      return NextResponse.json(
        { error: 'Unable to verify admin privileges.' },
        { status: 500 }
      );
    }

    if (roleRow && 'role' in roleRow) {
      effectiveRole = (roleRow.role ?? '').toLowerCase();
    }
  }

  if (effectiveRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const normalizedFeedback =
    typeof feedbackValue === 'string'
      ? feedbackValue.trim()
      : feedbackValue ?? null;

  const { data: updatedQuote, error: updateError } = await serviceClient
    .from('quotes')
    .update({
      admin_feedback:
        normalizedFeedback && normalizedFeedback.length > 0
          ? normalizedFeedback
          : null,
    })
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
