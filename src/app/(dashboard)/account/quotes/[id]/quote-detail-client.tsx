'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getQuoteDetailsAction, type MyQuote } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Phone, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export type QuoteWithFeedback = MyQuote & {
  adminFeedback?: string | null;
  userFeedback?: string | null;
};

type QuoteDetailClientProps = {
  quoteId: string;
};

export function QuoteDetailClient({ quoteId }: QuoteDetailClientProps) {
  const [quote, setQuote] = useState<QuoteWithFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFeedbackDraft, setUserFeedbackDraft] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const [isRequestCallOpen, setIsRequestCallOpen] = useState(false);
  const [isRequestingCall, setIsRequestingCall] = useState(false);
  const [requestCallError, setRequestCallError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchQuote() {
      if (!quoteId) return;
      setIsLoading(true);
      const result = await getQuoteDetailsAction(quoteId);

      if (result.success && result.data) {
        const anyQuote = result.data as any;
        const mapped: QuoteWithFeedback = {
          ...result.data,
          adminFeedback: anyQuote.admin_feedback ?? anyQuote.adminFeedback ?? null,
          userFeedback: anyQuote.user_feedback ?? anyQuote.userFeedback ?? null,
        };
        setQuote(mapped);
        setUserFeedbackDraft(mapped.userFeedback || '');
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    }

    void fetchQuote();
  }, [quoteId]);

  const handleOpenRequestCall = () => {
    if (!quote) return;

    if (!quote.adminFeedback || quote.adminFeedback.trim().length === 0) {
      toast({
        title: 'Call request unavailable',
        description:
          'You can request a call once our team has reviewed your quote and left feedback here.',
        variant: 'destructive',
      });
      return;
    }

    setRequestCallError(null);
    setIsRequestCallOpen(true);
  };

  const handleConfirmRequestCall = async () => {
    if (!quote) return;
    setIsRequestingCall(true);
    setRequestCallError(null);

    const prevQuote = quote;
    const optimisticallyUpdated: QuoteWithFeedback = {
      ...quote,
      status: 'call_requested',
    };
    setQuote(optimisticallyUpdated);

    try {
      const response = await fetch(`/api/quotes/${quote.id}/request-call`, {
        method: 'POST',
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(body?.error || 'Failed to request call.');
      }

      toast({
        title: 'Call requested',
        description: 'Our team will reach out to you shortly.',
      });
    } catch (err) {
      setQuote(prevQuote);
      setRequestCallError(
        err instanceof Error ? err.message : 'Failed to request call. Please try again.'
      );
    } finally {
      setIsRequestingCall(false);
      setIsRequestCallOpen(false);
    }
  };

  const handleSaveUserFeedback = async () => {
    if (!quote) return;

    setIsSavingFeedback(true);

    try {
      const response = await fetch(`/api/quotes/${quote.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: userFeedbackDraft }),
      });

      const body = (await response.json().catch(() => null)) as
        | { error?: string; quote?: QuoteWithFeedback }
        | null;

      if (!response.ok) {
        throw new Error(body?.error || 'Failed to save feedback.');
      }

      if (!body?.quote) {
        throw new Error('Feedback saved but response was incomplete.');
      }

      const normalizedQuote: QuoteWithFeedback = {
        ...body.quote,
        adminFeedback: (body.quote as any).admin_feedback ?? body.quote.adminFeedback ?? null,
        userFeedback: (body.quote as any).user_feedback ?? body.quote.userFeedback ?? null,
      };

      setQuote(normalizedQuote);
      setUserFeedbackDraft(normalizedQuote.userFeedback || '');

      toast({
        title: 'Feedback saved',
        description: 'Thanks for keeping us updated.',
      });
    } catch (err) {
      toast({
        title: 'Failed to save feedback',
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred while saving feedback.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const renderLoading = () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Separator className="my-6" />
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
      <p className="text-destructive">{error}</p>
    </div>
  );

  const renderQuote = () => {
    if (!quote) return null;

    const projectDescription =
      (quote as any).projectDescription ??
      (quote as any).project_description ??
      (quote as any).description ??
      'No description provided yet.';

    return (
      <>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {quote.title || 'Untitled Project'}
          </CardTitle>
          <CardDescription>
            Review Webara&apos;s feedback, leave your response, and request a call when you&apos;re ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Estimated Quote</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">
                {quote.estimatedCost ? `${quote.currency} ${quote.estimatedCost}` : 'No estimate provided.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Project Overview</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{projectDescription}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="text-accent h-5 w-5" />
                Creative Collaboration Ideas
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                {quote.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />
            <div className="space-y-4">
              {quote.adminFeedback && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Webara Feedback
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {quote.adminFeedback}
                  </p>
                </div>
              )}

              <div className="rounded-lg border bg-background p-4 space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Your Feedback To Webara
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use this space to confirm next steps, share your decision, or
                    leave a message such as &ldquo;We accept this, please call us
                    on +4477754138273&rdquo;.
                  </p>
                </div>
                <Textarea
                  value={userFeedbackDraft}
                  onChange={(e) => setUserFeedbackDraft(e.target.value)}
                  placeholder="Type your message to the Webara team..."
                  rows={4}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSavingFeedback}
                    onClick={() => setUserFeedbackDraft(quote.userFeedback || '')}
                  >
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSaveUserFeedback} disabled={isSavingFeedback}>
                    {isSavingFeedback ? 'Saving…' : 'Save Feedback'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col sm:flex-row gap-4 pt-6">
          <Button
            size="lg"
            onClick={handleOpenRequestCall}
            disabled={
              isLoading ||
              isRequestingCall ||
              !quote.adminFeedback ||
              quote.adminFeedback.trim().length === 0
            }
            className="w-full sm:w-auto"
          >
            <Phone className="mr-2" />
            {quote.status === 'call_requested' ? 'Call Requested' : 'Request a Call'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setUserFeedbackDraft('');
              setQuote((prev) => (prev ? { ...prev, status: 'rejected' } : prev));
            }}
            className="w-full sm:w-auto"
            disabled={isSavingFeedback}
          >
            <XCircle className="mr-2" /> Reject Offer
          </Button>
        </CardFooter>

        <Dialog open={isRequestCallOpen} onOpenChange={setIsRequestCallOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a call about this quote</DialogTitle>
              <DialogDescription>
                We&apos;ll review your details and call you to discuss the next
                steps for this specific quote.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {quote.adminFeedback ? (
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <p className="font-semibold text-xs uppercase text-muted-foreground">
                    Our feedback on your quote
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{quote.adminFeedback}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    A call can only be requested after this feedback is
                    provided. You&apos;re all set.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  Our team has not yet left feedback on this quote. A call
                  request cannot be submitted until feedback is available.
                </div>
              )}

              <div className="rounded-md border bg-background p-3 text-sm space-y-1">
                <p className="font-semibold">Phone number</p>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll use the phone number saved on your account/profile.
                  If it is missing or incorrect, please update it in your
                  account settings before confirming this request.
                </p>
              </div>

              {requestCallError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                  {requestCallError}
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsRequestCallOpen(false)}
                disabled={isRequestingCall}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRequestCall}
                disabled={
                  isRequestingCall ||
                  !quote.adminFeedback ||
                  quote.adminFeedback.trim().length === 0
                }
              >
                {isRequestingCall ? 'Requesting…' : 'Confirm Call Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>{isLoading ? renderLoading() : error ? renderError() : renderQuote()}</Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
