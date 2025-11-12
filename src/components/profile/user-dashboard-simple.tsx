'use client';

import { useState } from 'react';
import type { UserResource } from '@clerk/types';
import type { Database } from '@/lib/database.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Handshake, TrendingUp, Clock, Building2 } from 'lucide-react';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];
type QuoteRow = Database['public']['Tables']['quotes']['Row'];
type QuoteWithFeedback = QuoteRow & { admin_feedback?: string | null };

interface UserDashboardProps {
  user: UserResource;
  profile: ProfileRow | null;
  businesses: BusinessRow[];
  quotes: QuoteRow[];
  isLoading: boolean;
}

const quoteStatusBadgeClasses: Partial<Record<QuoteRow['status'], string>> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  call_requested: 'bg-purple-100 text-purple-700 border-purple-200',
  project_created: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
};

function statusLabel(status: QuoteRow['status']) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'under_review':
      return 'Under Review';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'call_requested':
      return 'Call Requested';
    case 'project_created':
      return 'Project Created';
    case 'draft':
    default:
      return 'Draft';
  }
}

export function UserDashboardSimple({ user, profile, businesses, quotes, isLoading }: UserDashboardProps) {
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithFeedback | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalQuotes = quotes.length;
  const activeQuotes = quotes.filter(q => ['accepted', 'project_created'].includes(q.status)).length;
  const pendingQuotes = quotes.filter(q => ['pending', 'under_review', 'call_requested'].includes(q.status)).length;
  const totalBusinesses = businesses.length;

  const openQuoteDetails = (quote: QuoteWithFeedback) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  const closeQuoteDetails = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedQuote(null);
    }
  };

  const selectedQuoteSuggestions =
    selectedQuote && Array.isArray(selectedQuote.ai_suggestions)
      ? selectedQuote.ai_suggestions
      : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotes}</div>
            <p className="text-xs text-muted-foreground">All proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeQuotes}</div>
            <p className="text-xs text-muted-foreground">Accepted or created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingQuotes}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBusinesses}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
          <CardDescription>
            Your latest collaboration requests and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              You haven&apos;t submitted any proposals yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px] text-center">Action</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.slice(0, 5).map((quote) => (
                  <TableRow
                    key={quote.id}
                    onClick={() => openQuoteDetails(quote)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="text-center whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openQuoteDetails(quote);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <button
                        type="button"
                        className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={(event) => {
                          event.stopPropagation();
                          openQuoteDetails(quote);
                        }}
                      >
                        {quote.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={quoteStatusBadgeClasses[quote.status]}
                      >
                        {statusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{quote.budget_range || '—'}</TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={closeQuoteDetails}>
        <DialogContent className="w-full max-w-4xl lg:max-w-5xl p-8 bg-background text-foreground border shadow-2xl">
          {selectedQuote && (
            <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-6">
              <DialogHeader>
                <DialogTitle>{selectedQuote.title}</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedQuote.created_at).toLocaleDateString()} •{' '}
                  {businesses.find((business) => business.id === selectedQuote.business_id)?.business_name ||
                    'Personal project'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase text-muted-foreground">Status</p>
                    <p className="mt-1 font-semibold">{statusLabel(selectedQuote.status)}</p>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${quoteStatusBadgeClasses[selectedQuote.status]}`}
                    >
                      {selectedQuote.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase text-muted-foreground">Budget</p>
                    <p className="mt-1 font-semibold">{selectedQuote.budget_range || 'Not specified'}</p>
                    {selectedQuote.estimated_cost && (
                      <p className="text-sm text-muted-foreground">
                        Estimated: {selectedQuote.currency} {selectedQuote.estimated_cost}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">Website Needs</p>
                  <p className="text-sm">{selectedQuote.website_needs}</p>
                </div>

                {selectedQuote.collaboration_preferences && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">Collaboration Preferences</p>
                    <p className="text-sm">{selectedQuote.collaboration_preferences}</p>
                  </div>
                )}

                {selectedQuote.ai_quote && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">AI Quote</p>
                    <p className="text-sm whitespace-pre-line">{selectedQuote.ai_quote}</p>
                  </div>
                )}

                {selectedQuoteSuggestions.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">AI Suggestions</p>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {selectedQuoteSuggestions.map((suggestion, index) => (
                        <li key={index}>
                          {typeof suggestion === 'string'
                            ? suggestion
                            : JSON.stringify(suggestion)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
                  <p className="text-xs uppercase text-muted-foreground">Admin Feedback</p>
                  <p className="text-sm">
                    {selectedQuote.admin_feedback && selectedQuote.admin_feedback.trim().length > 0
                      ? selectedQuote.admin_feedback
                      : 'No feedback from the admin team yet. Check back soon!'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Businesses Overview */}
      {businesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Businesses</CardTitle>
            <CardDescription>
              Businesses you have registered on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{business.business_name}</h3>
                      <p className="text-muted-foreground">{business.industry}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {business.company_size} • {business.business_type}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {business.business_type}
                    </Badge>
                  </div>
                  {business.description && (
                    <p className="mt-3 text-sm">{business.description}</p>
                  )}
                  {business.website && (
                    <div className="mt-3">
                      <Badge variant="outline" className="cursor-pointer">
                        <a 
                          href={business.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visit Website
                        </a>
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
