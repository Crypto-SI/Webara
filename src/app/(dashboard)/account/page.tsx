// src/app/(dashboard)/account/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useSimpleAuth } from '@/contexts/auth-context-simple';
import { createSupabaseClient } from '@/lib/supabase/client';
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
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  PhoneOutgoing,
  FileText,
  Search,
  Rocket,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { QuotesChart } from '@/components/quotes-chart';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const statusIcons: Record<QuoteStatus, React.ElementType> = {
  draft: FileText,
  pending: Clock,
  under_review: Search,
  accepted: CheckCircle,
  rejected: XCircle,
  call_requested: PhoneOutgoing,
  project_created: Rocket,
};

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-muted text-foreground border-border',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  under_review: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  call_requested: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  project_created: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
};

const statusLabels: Record<QuoteStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  call_requested: 'Call Requested',
  project_created: 'Project Created',
};

function statusLabel(status: QuoteStatus) {
  return statusLabels[status] ?? status;
}

const defaultStatusClass = 'bg-muted text-foreground border-border';

const formatQuoteEstimate = (quote: MyQuote) => {
  if (typeof quote.estimatedCost !== 'number' || Number.isNaN(quote.estimatedCost)) {
    return null;
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (quote.currency || 'USD').toUpperCase(),
      maximumFractionDigits: 0,
    }).format(quote.estimatedCost);
  } catch {
    return `$${quote.estimatedCost.toLocaleString()}`;
  }
};

function AccountPageContent() {
  const { user } = useSimpleAuth();
  const [quotes, setQuotes] = useState<MyQuote[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const supabase = createSupabaseClient();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [user]);

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

    return (Object.entries(counts) as [QuoteStatus, number][]).map(
      ([status, count], index) => ({
        status: statusLabel(status),
        count,
        fill: `hsl(var(--chart-${(index % 6) + 1}))`,
      })
    );
  }, [quotes]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          <div className="space-y-2">
             <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
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
                         const StatusIcon = statusIcons[quote.status] ?? FileText;
                         const badgeClass =
                           statusColors[quote.status] ?? defaultStatusClass;
                         const estimate = formatQuoteEstimate(quote);
                         return (
                          <Link key={quote.id} href={`/profile/quotes/${quote.id}`} passHref>
                            <div className="p-4 border rounded-lg bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${badgeClass}`}>
                                    <StatusIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground/90">{quote.title}</p>
                                    <p className="text-sm text-foreground/70">{quote.summary}</p>
                                    {estimate && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Est. Investment • {estimate}
                                      </p>
                                    )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                               <Badge variant="outline" className={badgeClass}>
                                 {statusLabel(quote.status)}
                               </Badge>
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
                      You don't have any saved quotes yet.
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
                       <span className="font-medium">{profile?.full_name || 'Not set'}</span>
                     </div>
                     <Separator />
                     <div className="flex items-center gap-4">
                       <Mail className="h-5 w-5 text-muted-foreground" />
                       <span className="font-medium">{user?.email || 'Not set'}</span>
                     </div>
                     <Separator />
                     <div className="flex items-center gap-4">
                       <Phone className="h-5 w-5 text-muted-foreground" />
                       <span className="font-medium">{profile?.phone || 'Not set'}</span>
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

export default function AccountPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <AccountPageContent />
    </ProtectedRoute>
  );
}
