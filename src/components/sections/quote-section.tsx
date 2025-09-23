'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { getAiQuoteAction } from '@/app/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { QuoteOutput } from '@/ai/flows/provide-ai-powered-quote';

export function QuoteSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuoteOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    const response = await getAiQuoteAction(values);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'An unknown error occurred.');
    }

    setIsDialogOpen(true);
    setIsLoading(false);
  }

  return (
    <>
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
                        Generate AI Quote
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
                  Here's Your AI-Powered Suggestion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This is a preliminary estimate and suggestion. A team member
                  will reach out to you shortly to discuss details.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <div>
                  <h4 className="mb-2 font-semibold">Estimated Quote</h4>
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
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
