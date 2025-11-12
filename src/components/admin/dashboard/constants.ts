import type { ProfileRow, QuoteRow } from './types';

export const roleBadgeClasses: Record<ProfileRow['role'], string> = {
  admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  webara_staff: 'bg-blue-100 text-blue-700 border-blue-200',
  user: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const quoteStatusBadgeClasses: Partial<Record<QuoteRow['status'], string>> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  call_requested: 'bg-purple-100 text-purple-700 border-purple-200',
  project_created: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const ALL_STATUSES: QuoteRow['status'][] = [
  'draft',
  'pending',
  'under_review',
  'accepted',
  'rejected',
  'call_requested',
  'project_created',
];

export const fullQuoteStatusClasses: Record<QuoteRow['status'], string> = ALL_STATUSES.reduce(
  (acc, status) => {
    acc[status] =
      quoteStatusBadgeClasses[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return acc;
  },
  {} as Record<QuoteRow['status'], string>
);
