// src/app/account/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getMyQuotesAction, type MyQuote, type QuoteStatus } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, Mail, Phone, Edit, CheckCircle, XCircle, Clock, PhoneOutgoing } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { QuotesChart } from '@/components/quotes-chart';


const statusIcons: { [key in QuoteStatus]: React.ElementType } = {
  Pending: Clock,
  Accepted: CheckCircle,
  Rejected: XCircle,
  Call Requested: PhoneOutgoing,
};

const statusColors: { [key in QuoteStatus]: string } = {
  Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
  Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  'Call Requested': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};


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

  const quoteStatusData = useMemo(() => {
    if (!quotes) return [];
    const counts = quotes.reduce((acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
    }, {} as Record<QuoteStatus, number>);
    
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: `hsl(var(--chart-${Object.keys(counts).indexOf(status) + 1}))`
    }));
  }, [quotes]);


  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          <div className="space-y-2">
             <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
             <p className="text-muted-foreground">Here's a summary of your account and recent activity.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tight">My Quotes</CardTitle>
                  <CardDescription>View your saved quotes below.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : quotes && quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((quote) => {
                         const StatusIcon = statusIcons[quote.status];
                         return (
                          <Link key={quote.id} href={`/account/quotes/${quote.id}`} passHref>
                            <div className="p-4 border rounded-lg bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${statusColors[quote.status]}`}>
                                    <StatusIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground/90">{quote.title}</p>
                                    <p className="text-sm text-foreground/70">{quote.summary}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                               <Badge variant="outline" className={statusColors[quote.status]}>{quote.status}</Badge>
                                <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                                  <ArrowRight />
                                </Button>
                              </div>
                            </div>
                          </Link>
                         )
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-foreground/70 py-8">
                      You don&apos;t have any saved quotes yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Account</CardTitle>
                  </div>
                   <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit
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
                    <CardTitle className="text-2xl font-bold tracking-tight">Quote Status</CardTitle>
                    <CardDescription>A summary of your quote statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : quoteStatusData.length > 0 ? (
                      <QuotesChart data={quoteStatusData} />
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No quote data available.</p>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
