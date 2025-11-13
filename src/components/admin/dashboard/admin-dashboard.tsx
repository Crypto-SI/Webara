'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { UsersWithProposals } from '@/components/admin/users-with-proposals';

import { DashboardHeader } from './dashboard-header';
import { SummaryGrid } from './summary-grid';
import { UsersTableCard } from './users-table-card';
import { CollaborationStatusCard } from './collaboration-status-card';
import { QuotesCard } from './quotes-card';
import { QuoteDialog } from './quote-dialog';
import { useAdminOverviewData, useQuoteDialog, useSignOutFlow } from './hooks';
import type { BusinessRow, ProfileRow, QuoteRow } from './types';
import { WeeklyExecutionTracker } from './weekly-execution-tracker';

export function AdminDashboard() {
  const { data, setData, isLoading, error, refresh } = useAdminOverviewData();
  const { isSigningOut, signOutDialogOpen, setSignOutDialogOpen, handleSignOut } = useSignOutFlow();
  const quoteDialog = useQuoteDialog(data, setData);

  const profileByUserId = useMemo(() => {
    if (!data) return {} as Record<string, ProfileRow>;
    return data.profiles.reduce<Record<string, ProfileRow>>((acc, profile) => {
      acc[profile.user_id] = profile;
      return acc;
    }, {});
  }, [data]);

  const businessById = useMemo(() => {
    if (!data) return {} as Record<string, BusinessRow>;
    return data.businesses.reduce<Record<string, BusinessRow>>((acc, business) => {
      acc[business.id] = business;
      return acc;
    }, {});
  }, [data]);

  const metrics = useMemo(() => {
    if (!data) {
      return {
        totalUsers: 0,
        businessCount: 0,
        collaborationCount: 0,
        pendingReviews: 0,
        adminCount: 0,
        staffCount: 0,
      };
    }

    const collaborationCount = data.quotes.filter((quote) =>
      ['accepted', 'project_created'].includes(quote.status)
    ).length;
    const pendingReviews = data.quotes.filter((quote) =>
      ['pending', 'under_review', 'call_requested'].includes(quote.status)
    ).length;

    return {
      totalUsers: data.profiles.length,
      businessCount: data.businesses.length,
      collaborationCount,
      pendingReviews,
      adminCount: data.profiles.filter((profile) => profile.role === 'admin').length,
      staffCount: data.profiles.filter((profile) => profile.role === 'webara_staff').length,
    };
  }, [data]);

  const statusBreakdown = useMemo(() => {
    if (!data) return {} as Record<QuoteRow['status'], number>;
    return data.quotes.reduce<Record<QuoteRow['status'], number>>((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<QuoteRow['status'], number>);
  }, [data]);

  const selectedQuoteOwner = quoteDialog.selectedQuote
    ? profileByUserId[quoteDialog.selectedQuote.user_id]
    : undefined;
  const selectedQuoteBusiness = quoteDialog.selectedQuote?.business_id
    ? businessById[quoteDialog.selectedQuote.business_id]
    : undefined;
  const selectedQuoteSuggestions =
    quoteDialog.selectedQuote && Array.isArray(quoteDialog.selectedQuote.ai_suggestions)
      ? quoteDialog.selectedQuote.ai_suggestions
      : [];

  return (
    <div className="min-h-screen bg-muted/20 pb-6 sm:pb-12">
      <div className="border-b bg-background">
        <DashboardHeader
          isLoading={isLoading}
          onRefresh={refresh}
          signOutDialogOpen={signOutDialogOpen}
          setSignOutDialogOpen={setSignOutDialogOpen}
          handleSignOut={handleSignOut}
          isSigningOut={isSigningOut}
        />
      </div>

      <div className="container mx-auto mt-6 flex flex-col gap-6 px-4">
        {error && (
          <Card className="border-destructive bg-destructive/5 text-destructive">
            <CardHeader>
              <CardTitle>Unable to load dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={refresh} size="sm">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <SummaryGrid metrics={metrics} isLoading={isLoading} />

        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3">
          <UsersTableCard profiles={data?.profiles ?? []} isLoading={isLoading} />
          <CollaborationStatusCard statusBreakdown={statusBreakdown} isLoading={isLoading} />
        </div>

        <QuotesCard
          quotes={data?.quotes ?? []}
          profiles={profileByUserId}
          businesses={businessById}
          isLoading={isLoading}
          onQuoteView={quoteDialog.openQuoteDialog}
        />

        <UsersWithProposals
          users={data?.profiles || []}
          businesses={data?.businesses || []}
          quotes={data?.quotes || []}
          onQuoteView={quoteDialog.openQuoteDialog}
        />
        <Card>
          <CardHeader>
            <CardTitle>Weekly Execution Tracker</CardTitle>
            <CardDescription>
              Track completion of your weekly marketing, content, YouTube, and ads tasks. This
              panel reads and writes to the secured Supabase tables so only admins can manage it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyExecutionTracker />
          </CardContent>
        </Card>
      </div>

      <QuoteDialog
        selectedQuote={quoteDialog.selectedQuote}
        owner={selectedQuoteOwner}
        business={selectedQuoteBusiness}
        suggestions={selectedQuoteSuggestions}
        isOpen={quoteDialog.isQuoteDialogOpen}
        onOpenChange={quoteDialog.handleQuoteDialogChange}
        feedbackDraft={quoteDialog.feedbackDraft}
        onFeedbackDraftChange={quoteDialog.handleFeedbackDraftChange}
        onSaveFeedback={quoteDialog.handleSaveFeedback}
        isSavingFeedback={quoteDialog.isSavingFeedback}
        feedbackError={quoteDialog.feedbackError}
        feedbackSuccess={quoteDialog.feedbackSuccess}
        onStatusChange={quoteDialog.handleStatusChange}
        isUpdatingStatus={quoteDialog.isUpdatingStatus}
        statusError={quoteDialog.statusError}
      />
    </div>
  );
}
