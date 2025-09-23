// src/app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getMyQuotesAction } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const [quotes, setQuotes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      setIsLoading(true);
      const result = await getMyQuotesAction();
      if (result.success) {
        setQuotes(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }

    fetchQuotes();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">My Account</CardTitle>
              <CardDescription>View your saved quotes below.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : quotes && quotes.length > 0 ? (
                <div className="space-y-4">
                  {quotes.map((quote, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-card-foreground/5">
                      <p className="text-foreground/90">{quote}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-foreground/70 py-8">
                  You don&apos;t have any saved quotes yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
