import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

import { ALL_STATUSES, fullQuoteStatusClasses, quoteStatusBadgeClasses } from './constants';
import { formatDate, statusLabel } from './formatters';
import type { BusinessRow, ProfileRow, QuoteRow } from './types';

type QuoteDialogProps = {
  selectedQuote: QuoteRow | null;
  owner?: ProfileRow;
  business?: BusinessRow;
  suggestions: unknown[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackDraft: string;
  onFeedbackDraftChange: (value: string) => void;
  onSaveFeedback: () => Promise<void> | void;
  isSavingFeedback: boolean;
  feedbackError: string | null;
  feedbackSuccess: string | null;
  onStatusChange: (quoteId: string, status: QuoteRow['status']) => Promise<void> | void;
  isUpdatingStatus: boolean;
  statusError: string | null;
};

export function QuoteDialog({
  selectedQuote,
  owner,
  business,
  suggestions,
  isOpen,
  onOpenChange,
  feedbackDraft,
  onFeedbackDraftChange,
  onSaveFeedback,
  isSavingFeedback,
  feedbackError,
  feedbackSuccess,
  onStatusChange,
  isUpdatingStatus,
  statusError,
}: QuoteDialogProps) {
  if (!selectedQuote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-responsive max-w-4xl">
        <DialogHeader className="flex flex-col items-start gap-2">
          <div className="flex w-full items-start justify-between gap-4">
            <div>
              <DialogTitle>{selectedQuote.title}</DialogTitle>
              <DialogDescription>
                Submitted {formatDate(selectedQuote.created_at)} ·{' '}
                {business?.business_name || 'Personal project'}
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`px-3 py-1 text-xs font-semibold ${
                      fullQuoteStatusClasses[selectedQuote.status]
                    }`}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? 'Updating...' : statusLabel(selectedQuote.status)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Set quote status</DropdownMenuLabel>
                  {ALL_STATUSES.map((status) => (
                    <DropdownMenuItem key={status} onClick={() => onStatusChange(selectedQuote.id, status)}>
                      {statusLabel(status)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-[10px] text-muted-foreground">Admin-only • any status</p>
              {statusError && (
                <p className="text-[10px] text-destructive max-w-xs text-right">{statusError}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase text-muted-foreground">Status</p>
            <p className="mt-1 font-semibold">{statusLabel(selectedQuote.status)}</p>
            <Badge variant="outline" className={`mt-2 ${quoteStatusBadgeClasses[selectedQuote.status] ?? ''}`}>
              {statusLabel(selectedQuote.status)}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">Updated {formatDate(selectedQuote.updated_at)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase text-muted-foreground">Budget</p>
            <p className="mt-1 font-semibold">{selectedQuote.budget_range || 'Not specified'}</p>
            {selectedQuote.estimated_cost && (
              <p className="text-sm text-muted-foreground">
                Estimate: {selectedQuote.currency} {selectedQuote.estimated_cost}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border p-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Requester</p>
              <p className="font-semibold">{owner?.full_name || owner?.email || 'Unknown user'}</p>
              <p className="text-sm text-muted-foreground">{owner?.email || 'No email available'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Business</p>
              <p className="font-semibold">{business?.business_name || 'Personal project'}</p>
              {business?.website && (
                <a href={business.website} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                  {business.website}
                </a>
              )}
            </div>
          </div>

          {Array.isArray(suggestions) && suggestions.length > 0 && (
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">AI Suggestions</p>
              <ul className="mt-2 space-y-2 text-sm">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="rounded bg-muted/40 p-2">
                    {String(suggestion)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-4 space-y-3">
            <p className="text-xs uppercase text-muted-foreground">Admin Feedback</p>
            <Textarea
              value={feedbackDraft}
              onChange={(event) => onFeedbackDraftChange(event.target.value)}
              placeholder="Let the requester know what happens next..."
              rows={4}
            />
            {feedbackError && <p className="text-sm text-destructive">{feedbackError}</p>}
            {feedbackSuccess && <p className="text-sm text-emerald-600">{feedbackSuccess}</p>}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => onFeedbackDraftChange(selectedQuote.admin_feedback ?? '')}
                disabled={isSavingFeedback}
              >
                Reset
              </Button>
              <Button onClick={onSaveFeedback} disabled={isSavingFeedback}>
                {isSavingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Admin Feedback
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4 space-y-2">
            <p className="text-xs uppercase text-muted-foreground">User Feedback to Admin</p>
            {selectedQuote.user_feedback ? (
              <p className="text-sm whitespace-pre-wrap">{selectedQuote.user_feedback}</p>
            ) : (
              <p className="text-sm text-muted-foreground">The user has not left any feedback yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
