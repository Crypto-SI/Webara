import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const statusClasses: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  received: 'bg-sky-100 text-sky-700',
  'in progress': 'bg-amber-100 text-amber-700',
  in_progress: 'bg-amber-100 text-amber-700',
  not_started: 'bg-slate-200 text-slate-700',
  expired: 'bg-rose-100 text-rose-700',
  overdue: 'bg-rose-100 text-rose-700',
  done: 'bg-emerald-100 text-emerald-700',
  present: 'bg-emerald-100 text-emerald-700',
  required: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-200 text-slate-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export function StatusChip({ value }: { value: string }) {
  return <Badge className={cn('capitalize', statusClasses[value] ?? 'bg-slate-100 text-slate-700')}>{value.replaceAll('_', ' ')}</Badge>;
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
