import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { quoteStatusBadgeClasses } from './constants';
import { LoadingListPlaceholder } from './placeholders';
import { statusLabel } from './formatters';
import type { QuoteRow } from './types';

type CollaborationStatusCardProps = {
  statusBreakdown: Record<QuoteRow['status'], number>;
  isLoading: boolean;
};

export function CollaborationStatusCard({ statusBreakdown, isLoading }: CollaborationStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Status</CardTitle>
        <CardDescription>Snapshot of quote stages across the funnel.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingListPlaceholder rows={5} />
        ) : (
          <div className="space-y-3">
            {(Object.keys(statusBreakdown) as QuoteRow['status'][]).map((status) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
              >
                <Badge variant="outline" className={quoteStatusBadgeClasses[status]}>
                  {statusLabel(status)}
                </Badge>
                <span className="font-medium">{statusBreakdown[status]}</span>
              </div>
            ))}
            {Object.keys(statusBreakdown).length === 0 && (
              <p className="text-sm text-muted-foreground">No quotes found yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
