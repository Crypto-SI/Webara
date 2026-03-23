import { NextResponse } from 'next/server';
import { requireAuthenticatedProfile } from '@/lib/auth-server';

export async function POST() {
  try {
    const { profile } = await requireAuthenticatedProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
