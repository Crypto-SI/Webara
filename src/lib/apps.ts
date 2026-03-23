import type { Database } from '@/lib/database.types';

export type AppRow = Database['public']['Tables']['apps']['Row'];
export type AppStatus = AppRow['status'];

export const APP_STATUS_OPTIONS: AppStatus[] = ['active', 'planning', 'archived'];

export function slugifyAppName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function normalizeWebsiteUrl(value: unknown) {
  return normalizeOptionalUrl(value, 'Website URL');
}

export function normalizeSupabaseDashboardUrl(value: unknown) {
  return normalizeOptionalUrl(value, 'Supabase dashboard URL');
}

function normalizeOptionalUrl(value: unknown, label: string) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return null;

  const candidate = raw.includes('://') ? raw : `https://${raw}`;

  try {
    return new URL(candidate).toString();
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

export function normalizeAppStatus(value: unknown): AppStatus {
  const status = typeof value === 'string' ? value : '';
  if (APP_STATUS_OPTIONS.includes(status as AppStatus)) {
    return status as AppStatus;
  }
  return 'active';
}

export function normalizeSortOrder(value: unknown) {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim().length > 0
        ? Number.parseInt(value, 10)
        : 0;

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Sort order must be zero or greater.');
  }

  return parsed;
}
