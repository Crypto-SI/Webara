import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageCircle } from 'lucide-react';

import { quoteStatusBadgeClasses } from './constants';
import { statusLabel } from './formatters';
import { LoadingTablePlaceholder } from './placeholders';
import type { BusinessRow, ProfileRow, QuoteRow } from './types';

type QuotesCardProps = {
  quotes: QuoteRow[];
  profiles: Record<string, ProfileRow>;
  businesses: Record<string, BusinessRow>;
  isLoading: boolean;
  onQuoteView: (quote: QuoteRow) => void;
};

export function QuotesCard({ quotes, profiles, businesses, isLoading, onQuoteView }: QuotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quotes & Feedback</CardTitle>
        <CardDescription>
          Review collaboration requests and see both Webara and user feedback in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="table-scroll-x">
        {isLoading ? (
          <LoadingTablePlaceholder rows={4} columns={6} />
        ) : quotes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin Feedback</TableHead>
                <TableHead>User Feedback</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const profile = profiles[quote.user_id];
                const business = quote.business_id ? businesses[quote.business_id] : undefined;

                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.title || 'Untitled Project'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{profile?.full_name || profile?.email || 'Unknown user'}</p>
                        <p className="text-xs text-muted-foreground">
                          {business?.business_name || 'Personal project'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={quoteStatusBadgeClasses[quote.status]}>
                        {statusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {quote.admin_feedback || (
                        <span className="text-muted-foreground">No admin feedback yet</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {quote.user_feedback || (
                        <span className="text-muted-foreground">User has not left feedback</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => onQuoteView(quote)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">No quotes yet</p>
              <p className="text-sm text-muted-foreground">
                New user submissions will appear here for review.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
