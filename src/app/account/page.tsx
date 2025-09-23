// src/app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getMyQuotesAction, type MyQuote } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Mail, Phone, Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AccountPage() {
  const [quotes, setQuotes] = useState<MyQuote[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user data - in a real app, this would come from your auth provider
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
  };

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
        <div className="container mx-auto max-w-4xl px-4 space-y-8">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">Account Information</CardTitle>
                <CardDescription>View and edit your personal details.</CardDescription>
              </div>
               <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{user.email}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{user.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">My Quotes</CardTitle>
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
                  {quotes.map((quote) => (
                    <Link key={quote.id} href={`/account/quotes/${quote.id}`} passHref>
                       <div className="p-4 border rounded-lg bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground/90">{quote.title}</p>
                          <p className="text-sm text-foreground/70">{quote.summary}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight />
                        </Button>
                      </div>
                    </Link>
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
