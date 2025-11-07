// src/app/profile/quotes/[id]/page.tsx
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
import { useToast } from "@/hooks/use-toast";

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const [quote, setQuote] = useState<MyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const id = params.id;
    async function fetchQuote() {
      if (!id) return;
      setIsLoading(true);
      const result = await getQuoteDetailsAction(id);
      if (result.success) {
        setQuote(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }

    fetchQuote();
  }, [params.id]);

  const handleRequestCall = () => {
    // In a real app, this would trigger a backend process
    console.log("Requesting a call for quote:", params.id);
    toast({
      title: "Call Requested",
      description: "Our team will be in touch with you shortly!",
    });
  };

  const handleRejectOffer = () => {
    // In a real app, this would update the quote status in the database
    console.log("Offer rejected for quote:", params.id);
    toast({
      title: "Offer Status Updated",
      description: "Thank you for your feedback. The offer has been marked as rejected.",
      variant: "destructive"
    });
  };


  const renderLoading = () => (
     <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Separator className="my-6" />
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
    </div>
  );

  const renderQuote = () => (
    quote && (
      <>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">{quote.title}</CardTitle>
          <CardDescription>Review your quote details and proposed collaboration models below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Estimated Quote</h3>
            <p className="text-foreground/80 whitespace-pre-wrap">{quote.quote}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-2">Suggested Collaboration</h3>
            <p className="text-foreground/80 whitespace-pre-wrap">{quote.suggestedCollaboration}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="text-accent h-5 w-5"/>
                Creative Collaboration Ideas
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-foreground/80">
              {quote.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-4 pt-6">
            <Button size="lg" onClick={handleRequestCall} className="w-full sm:w-auto">
                <Phone className="mr-2"/> Request a Call
            </Button>
            <Button size="lg" variant="outline" onClick={handleRejectOffer} className="w-full sm:w-auto">
                <XCircle className="mr-2"/> Reject Offer
            </Button>
        </CardFooter>
      </>
    )
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            {isLoading
              ? renderLoading()
              : error
              ? renderError()
              : renderQuote()}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
