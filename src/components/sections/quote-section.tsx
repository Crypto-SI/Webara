'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/nextjs';
import { QuoteFormSchema, type QuoteFormValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getAiQuoteAction,
  getTtsAction,
  proposeQuoteAction,
  type AiQuoteAndSuggestions,
} from '@/app/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Sparkles, Volume2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function QuoteSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiQuoteAndSuggestions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isSignedIn } = useUser();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(QuoteFormSchema),
    defaultValues: {
      name: '',
      email: '',
      websiteNeeds: '',
      collaborationPreferences: '',
      budget: '',
    },
  });

  async function onSubmit(values: QuoteFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedQuoteId(null);
    setSaveError(null);

    const response = await getAiQuoteAction(values);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'An unknown error occurred.');
    }

    setIsDialogOpen(true);
    setIsLoading(false);
  }

  async function handlePlayTts() {
    if (!result?.quote) return;
    if (audioRef.current?.src) {
      audioRef.current.play();
      return;
    }

    setIsTtsLoading(true);
    const response = await getTtsAction(result.quote);
    setIsTtsLoading(false);

    if (response.success && response.data) {
      if (audioRef.current) {
        audioRef.current.src = response.data.media;
        audioRef.current.play();
      }
    } else {
      // You could show a toast or error message here
      console.error(response.error);
    }
  }

  async function handleProposeQuote() {
    if (!result) return;
    if (!isSignedIn) {
      setSaveError('Please sign in to save this proposal to your dashboard.');
      return;
    }

    setIsSavingQuote(true);
    setSaveError(null);

    const response = await proposeQuoteAction({
      formValues: form.getValues(),
      aiResult: result,
    });

    if (response.success && response.data) {
      setSavedQuoteId(response.data.id);
    } else {
      setSaveError(
        response.error ||
          'We could not send this proposal to Webara. Please try again.'
      );
    }

    setIsSavingQuote(false);
  }

  const formatEstimate = (amount?: number, currency?: string) => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: (currency || 'USD').toUpperCase(),
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${amount.toLocaleString()}`;
    }
  };

  const extractCollaborationFocus = (text: string) => {
    return (
      text
        .split('.')
        .map((sentence) => sentence.trim())
        .find((sentence) => sentence.length > 0) || text
    );
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" />
      <section id="contact" className="w-full py-20 md:py-28 lg:py-32 bg-card">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Get an Instant AI Quote
              </CardTitle>
              <CardDescription className="mx-auto max-w-[700px] pt-2 text-foreground/80 md:text-xl">
                Fill out the form below and let our AI provide you with a
                preliminary quote and creative collaboration ideas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="websiteNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tell us about your website needs</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., I need a 5-page e-commerce site for my clothing brand..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="collaborationPreferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Collaboration Preferences (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Revenue sharing, price per lead"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., $5,000 - $10,000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Quote & Suggestions
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          {result ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  Here&apos;s Your AI-Powered Suggestion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This is a preliminary estimate and suggestion. A team member
                  will reach out to you shortly to discuss details.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4 space-y-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Project Title
                    </p>
                    <p className="text-base font-semibold">
                      {result.projectTitle}
                    </p>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {result.projectSummary}
                  </p>
                  <div className="grid gap-3 pt-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border/50 bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Estimated Investment
                      </p>
                      <p className="text-lg font-semibold">
                        {formatEstimate(result.estimatedCost, result.currency) ||
                          'Pending refinement'}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/50 bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Collaboration Focus
                      </p>
                      <p className="text-sm font-semibold">
                        {extractCollaborationFocus(
                          result.suggestedCollaboration
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Estimated Quote</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePlayTts}
                      disabled={isTtsLoading}
                      aria-label="Listen to quote"
                    >
                      {isTtsLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Volume2 />
                      )}
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground/80">
                    {result.quote}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Suggested Collaboration
                  </h4>
                  <p className="whitespace-pre-wrap text-sm text-foreground/80">
                    {result.suggestedCollaboration}
                  </p>
                </div>
                {result.suggestions && result.suggestions.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">
                      Creative Collaboration Ideas
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {error || 'Something went wrong. Please try again.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
          )}
          <AlertDialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {saveError && <p className="text-destructive">{saveError}</p>}
              {savedQuoteId && (
                <p className="text-emerald-600">
                  Proposal sent! You can review it from your dashboard.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!savedQuoteId && result && (
                <Button
                  type="button"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleProposeQuote}
                  disabled={isSavingQuote}
                >
                  {isSavingQuote ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Propose to Webara
                </Button>
              )}
              {savedQuoteId && (
                <Button variant="outline" asChild>
                  <Link href="/profile">View Dashboard</Link>
                </Button>
              )}
              <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                Close
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
