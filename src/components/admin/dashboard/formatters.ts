import type { QuoteRow } from './types';

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimestamp(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status: QuoteRow['status']) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'under_review':
      return 'Under Review';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'call_requested':
      return 'Call Requested';
    case 'project_created':
      return 'Project Created';
    case 'draft':
    default:
      return 'Draft';
  }
}
