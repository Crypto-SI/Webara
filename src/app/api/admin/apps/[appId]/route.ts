import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseContext } from '@/lib/admin-auth';
import {
  normalizeAppStatus,
  normalizeSortOrder,
  normalizeWebsiteUrl,
  slugifyAppName,
} from '@/lib/apps';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

type AdminSupabaseClient = ReturnType<typeof createAdminSupabaseClient>;

async function resolveUniqueSlug(
  supabase: AdminSupabaseClient,
  baseSlug: string,
  excludeId: string
) {
  const safeBase = baseSlug || 'app';
  const { data, error } = await supabase
    .from('apps')
    .select('id, slug')
    .ilike('slug', `${safeBase}%`);

  if (error) {
    throw new Error(`Failed to validate app slug: ${error.message}`);
  }

  const existing = new Set(
    (data ?? [])
      .filter((row) => row.id !== excludeId)
      .map((row) => row.slug)
  );

  if (!existing.has(safeBase)) return safeBase;

  let suffix = 2;
  while (existing.has(`${safeBase}-${suffix}`)) {
    suffix += 1;
  }

  return `${safeBase}-${suffix}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const admin = await getAdminSupabaseContext();
  if ('errorResponse' in admin) {
    return admin.errorResponse;
  }

  try {
    const { appId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'App name is required.' }, { status: 400 });
    }

    const websiteUrl = normalizeWebsiteUrl(body.website_url);
    const description =
      typeof body.description === 'string' && body.description.trim().length > 0
        ? body.description.trim()
        : null;
    const status = normalizeAppStatus(body.status);
    const sortOrder = normalizeSortOrder(body.sort_order);
    const slug = await resolveUniqueSlug(admin.supabase, slugifyAppName(name), appId);

    const { data, error } = await admin.supabase
      .from('apps')
      .update({
        name,
        slug,
        website_url: websiteUrl,
        description,
        status,
        sort_order: sortOrder,
        updated_by: admin.userId,
      })
      .eq('id', appId)
      .select('*')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Unable to update app.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ app: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request.' },
      { status: 400 }
    );
  }
}
