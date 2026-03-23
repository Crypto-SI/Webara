import { NextResponse } from 'next/server';
import { requireAuthenticatedProfileFromRequest } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { profile } = await requireAuthenticatedProfileFromRequest(request);
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
