import { NextRequest, NextResponse } from 'next/server';

const LISTMONK_URL = process.env.LISTMONK_PUBLIC_URL;
const LISTMONK_LIST_UUID = process.env.LISTMONK_WEBARA_LIST_UUID;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!LISTMONK_URL || !LISTMONK_LIST_UUID) {
      console.error('Missing LISTMONK_PUBLIC_URL or LISTMONK_WEBARA_LIST_UUID env vars');
      return NextResponse.json(
        { error: 'Newsletter is not configured.' },
        { status: 500 }
      );
    }

    const res = await fetch(`${LISTMONK_URL}/api/public/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        list_uuids: [LISTMONK_LIST_UUID],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Listmonk returns specific error messages
      const msg = data.message || data.error || 'Subscription failed.';
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
