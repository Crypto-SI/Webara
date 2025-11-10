'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useSimpleAuth } from '@/contexts/auth-context-simple';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Loader2,
  LogOut,
  RefreshCw,
  Users as UsersIcon,
  Handshake,
  MessageCircle,
} from 'lucide-react';
import { UsersWithProposals } from '@/components/admin/users-with-proposals';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];
type QuoteRow = Database['public']['Tables']['quotes']['Row'];

type AdminOverviewPayload = {
  profiles: ProfileRow[];
  businesses: BusinessRow[];
  quotes: QuoteRow[];
};

const roleBadgeClasses: Record<ProfileRow['role'], string> = {
  admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  webara_staff: 'bg-blue-100 text-blue-700 border-blue-200',
  user: 'bg-slate-100 text-slate-700 border-slate-200',
};

const quoteStatusBadgeClasses: Partial<Record<QuoteRow['status'], string>> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  call_requested: 'bg-purple-100 text-purple-700 border-purple-200',
  project_created: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <AdminGate>
        <DashboardContent />
      </AdminGate>
    </ProtectedRoute>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading, profile, refreshProfile } = useSimpleAuth();
  const router = useRouter();
  const profileRole = profile?.role?.toLowerCase();
  const userRole =
    (user?.unsafeMetadata?.role as string | undefined)?.toLowerCase();
  const appRole =
    (user?.publicMetadata?.role as string | undefined)?.toLowerCase();
  const isAdmin =
    profileRole === 'admin' || userRole === 'admin' || appRole === 'admin';

  const [attemptedRefresh, setAttemptedRefresh] = useState(false);

  useEffect(() => {
    if (user && !profile && !loading && !attemptedRefresh) {
      setAttemptedRefresh(true);
      void refreshProfile();
    }
  }, [user, profile, loading, attemptedRefresh, refreshProfile]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAdmin) {
      router.replace('/profile');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

function DashboardContent() {
  const [data, setData] = useState<AdminOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRow | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const { signOut } = useSimpleAuth();
  const router = useRouter();

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/overview', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!body || Object.keys(body).length === 0) {
          throw new Error(
            `API returned status ${response.status} with no error message`
          );
        }

        throw new Error(body?.error || `API error: ${response.status}`);
      }

      const payload = (await response.json()) as AdminOverviewPayload;
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unexpected error loading data.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const profileByUserId = useMemo(() => {
    if (!data) return {};
    return data.profiles.reduce<Record<string, ProfileRow>>((acc, profile) => {
      acc[profile.user_id] = profile;
      return acc;
    }, {});
  }, [data]);

  const businessById = useMemo(() => {
    if (!data) return {};
    return data.businesses.reduce<Record<string, BusinessRow>>(
      (acc, business) => {
        acc[business.id] = business;
        return acc;
      },
      {} as Record<string, BusinessRow>
    );
  }, [data]);

  const totalUsers = data?.profiles.length ?? 0;
  const businessCount = data?.businesses.length ?? 0;
  const collaborationCount =
    data?.quotes.filter((quote) =>
      ['accepted', 'project_created'].includes(quote.status)
    ).length ?? 0;
  const pendingReviews =
    data?.quotes.filter((quote) =>
      ['pending', 'under_review'].includes(quote.status)
    ).length ?? 0;

  const callRequestedCount =
    data?.quotes.filter((quote) => quote.status === 'call_requested').length ??
    0;

  const adminCount =
    data?.profiles.filter((profile) => profile.role === 'admin').length ?? 0;
  const staffCount =
    data?.profiles.filter((profile) => profile.role === 'webara_staff').length ??
    0;

  const statusBreakdown = useMemo(() => {
    if (!data) return {} as Record<QuoteRow['status'], number>;
    return data.quotes.reduce<Record<QuoteRow['status'], number>>(
      (acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
      },
      {} as Record<QuoteRow['status'], number>
    );
  }, [data]);

  const selectedQuoteOwner = selectedQuote
    ? profileByUserId[selectedQuote.user_id]
    : undefined;
  const selectedQuoteBusiness = selectedQuote?.business_id
    ? businessById[selectedQuote.business_id]
    : undefined;
  const selectedQuoteSuggestions =
    selectedQuote && Array.isArray(selectedQuote.ai_suggestions)
      ? selectedQuote.ai_suggestions
      : [];

  const openQuoteDialog = (quote: QuoteRow) => {
    setSelectedQuote(quote);
    setFeedbackDraft(quote.admin_feedback ?? '');
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setStatusError(null);
    setIsQuoteDialogOpen(true);
  };

  const handleQuoteDialogChange = (open: boolean) => {
    setIsQuoteDialogOpen(open);
    if (!open) {
      setSelectedQuote(null);
      setFeedbackDraft('');
      setFeedbackError(null);
      setFeedbackSuccess(null);
      setStatusError(null);
      setIsUpdatingStatus(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
      setSignOutDialogOpen(false);
    }
  };

  const handleFeedbackDraftChange = (value: string) => {
    if (feedbackError) {
      setFeedbackError(null);
    }
    if (feedbackSuccess) {
      setFeedbackSuccess(null);
    }
    setFeedbackDraft(value);
  };

  const handleSaveFeedback = async () => {
    if (!selectedQuote) return;

    setIsSavingFeedback(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/quotes/${selectedQuote.id}/feedback`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedback: feedbackDraft }),
        }
      );

      const body = (await response.json().catch(() => null)) as
        | { error?: string; quote?: QuoteRow }
        | null;

      if (!response.ok) {
        throw new Error(body?.error || 'Failed to save feedback.');
      }

      if (!body?.quote) {
        throw new Error('Feedback saved but response was incomplete.');
      }

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          quotes: prev.quotes.map((quote) =>
            quote.id === body.quote!.id ? body.quote! : quote
          ),
        };
      });

      setSelectedQuote(body.quote);
      setFeedbackDraft(body.quote.admin_feedback ?? '');
      setFeedbackSuccess('Feedback saved successfully.');
    } catch (err) {
      setFeedbackError(
        err instanceof Error ? err.message : 'Failed to save feedback.'
      );
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const allStatuses: QuoteRow['status'][] = [
    'draft',
    'pending',
    'under_review',
    'accepted',
    'rejected',
    'call_requested',
    'project_created',
  ];

  const quoteStatusBadgeClassesLocal: Record<QuoteRow['status'], string> = {
    pending: quoteStatusBadgeClasses.pending!,
    under_review: quoteStatusBadgeClasses.under_review!,
    accepted: quoteStatusBadgeClasses.accepted!,
    rejected: quoteStatusBadgeClasses.rejected!,
    call_requested: quoteStatusBadgeClasses.call_requested!,
    project_created: quoteStatusBadgeClasses.project_created!,
    draft: quoteStatusBadgeClasses.draft!,
  };

  const handleStatusChange = async (quoteId: string, nextStatus: QuoteRow['status']) => {
    if (!data || !selectedQuote || selectedQuote.id !== quoteId) return;

    setIsUpdatingStatus(true);
    setStatusError(null);

    // Optimistic update snapshot
    const prevData = data;
    const prevSelected = selectedQuote;

    const optimisticallyUpdatedQuote: QuoteRow = {
      ...selectedQuote,
      status: nextStatus,
    };

    setSelectedQuote(optimisticallyUpdatedQuote);
    setData({
      ...data,
      quotes: data.quotes.map((q) =>
        q.id === quoteId ? { ...q, status: nextStatus } : q
      ),
    });

    try {
      const response = await fetch(
        `/api/admin/quotes/${encodeURIComponent(quoteId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const body = (await response.json().catch(() => null)) as
        | { error?: string; quote?: QuoteRow }
        | null;

      if (!response.ok) {
        // revert on failure
        setData(prevData);
        setSelectedQuote(prevSelected);
        throw new Error(body?.error || 'Failed to update status.');
      }

      if (!body?.quote) {
        // revert if payload missing
        setData(prevData);
        setSelectedQuote(prevSelected);
        throw new Error('Status updated but response was incomplete.');
      }

      // Use server quote as source of truth
      setData((current) =>
        current
          ? {
              ...current,
              quotes: current.quotes.map((q) =>
                q.id === body.quote!.id ? body.quote! : q
              ),
            }
          : current
      );
      setSelectedQuote(body.quote);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update status.';
      setStatusError(msg);
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-6 sm:pb-12">
      <div className="border-b bg-background">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <Logo className="w-fit rounded-full border border-border/70 bg-background px-3 py-1.5 shadow-sm transition hover:scale-105" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monitor users, businesses, collaborations, and feedback.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start md:justify-end">
            <Button asChild size="sm" className="w-full xs:w-auto sm:w-auto">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              disabled={isLoading}
              className="w-full xs:w-auto sm:w-auto"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
            <AlertDialog
              open={signOutDialogOpen}
              onOpenChange={setSignOutDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full xs:w-auto sm:w-auto"
                >
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dialog-responsive">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Sign out of your account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be returned to the landing page. Any unsaved work
                    will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSigningOut}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-6 px-4 space-y-6">
        {error && (
          <Card className="border-destructive/40 bg-destructive/10 text-destructive">
            <CardHeader>
              <CardTitle>Unable to load data</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Users"
            value={totalUsers}
            description={`Admins: ${adminCount} • Staff: ${staffCount}`}
            icon={
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
            }
            isLoading={isLoading}
          />
          <SummaryCard
            title="Businesses"
            value={businessCount}
            description="Active records in the pipeline"
            icon={
              <Building2 className="h-5 w-5 text-muted-foreground" />
            }
            isLoading={isLoading}
          />
          <SummaryCard
            title="Active Collaborations"
            value={collaborationCount}
            description="Accepted or project-created engagements"
            icon={
              <Handshake className="h-5 w-5 text-muted-foreground" />
            }
            isLoading={isLoading}
          />
          <SummaryCard
            title="Items Requiring Attention"
            value={pendingReviews}
            description="Pending, under review, or call requested"
            icon={
              <Loader2 className="h-5 w-5 text-muted-foreground" />
            }
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 responsive-card">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Full list of platform accounts.
                </CardDescription>
              </div>
              {!isLoading && (
                <span className="text-sm text-muted-foreground">
                  Last updated {formatTimestamp(new Date())}
                </span>
              )}
            </CardHeader>
            <CardContent className="table-scroll-x">
              {isLoading ? (
                <LoadingTablePlaceholder rows={4} columns={5} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.profiles.map((profile) => {
                      return (
                        <TableRow key={profile.user_id}>
                          <TableCell className="font-medium">
                            {profile.full_name ||
                              profile.email ||
                              '—'}
                          </TableCell>
                          <TableCell>
                            {profile.email || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                roleBadgeClasses[
                                  profile.role || 'user'
                                ]
                              }
                            >
                              {profile.role || 'user'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              profile.clerk_created_at
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              profile.clerk_last_sign_in_at
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaboration Status</CardTitle>
              <CardDescription>
                Snapshot of quote stages across the funnel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingListPlaceholder rows={5} />
              ) : data ? (
                <div className="space-y-3">
                  {(Object.keys(
                    statusBreakdown
                  ) as (keyof typeof statusBreakdown)[]).map(
                    (status) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                      >
                        <Badge
                          variant="outline"
                          className={
                            quoteStatusBadgeClasses[status]
                          }
                        >
                          {statusLabel(status)}
                        </Badge>
                        <span className="font-medium">
                          {statusBreakdown[status]}
                        </span>
                      </div>
                    )
                  )}
                  {Object.keys(statusBreakdown).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No quotes found yet.
                    </p>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Quotes list with feedback visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes & Feedback</CardTitle>
            <CardDescription>
              Review collaboration requests and see both Webara and user
              feedback in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="table-scroll-x">
            {isLoading ? (
              <LoadingTablePlaceholder
                rows={4}
                columns={6}
              />
            ) : data && data.quotes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Feedback</TableHead>
                    <TableHead>User Feedback</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.quotes.map((quote) => {
                    const ownerProfile =
                      profileByUserId[quote.user_id];
                    return (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                          {quote.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>
                              {ownerProfile?.full_name ||
                                '—'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ownerProfile?.email || '—'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              quoteStatusBadgeClasses[
                                quote.status
                              ]
                                ? quoteStatusBadgeClasses[quote.status]
                                : ''
                            }
                          >
                            {statusLabel(quote.status)}
                          </Badge>
                          {quote.status === 'call_requested' && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                              Call requested
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {quote.admin_feedback ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageCircle className="h-3 w-3" />
                              <span>
                                {quote.admin_feedback.length >
                                40
                                  ? `${quote.admin_feedback.slice(
                                      0,
                                      40
                                    )}…`
                                  : quote.admin_feedback}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No admin message
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {quote.user_feedback ? (
                            <div className="flex items-center gap-1 text-xs text-emerald-700">
                              <MessageCircle className="h-3 w-3" />
                              <span>
                                {quote.user_feedback.length >
                                40
                                  ? `${quote.user_feedback.slice(
                                      0,
                                      40
                                    )}…`
                                  : quote.user_feedback}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No user message
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openQuoteDialog(quote)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No collaboration requests have been submitted
                yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={isQuoteDialogOpen}
          onOpenChange={handleQuoteDialogChange}
        >
          <DialogContent className="dialog-responsive">
            {selectedQuote && (
              <div className="space-y-6 overflow-y-auto pr-2 max-h-[calc(90vh-4rem)]">
                <DialogHeader className="flex flex-col items-start gap-2">
                  <div className="flex w-full items-start justify-between gap-4">
                    <div>
                      <DialogTitle>
                        {selectedQuote.title}
                      </DialogTitle>
                      <DialogDescription>
                        Submitted{' '}
                        {formatDate(selectedQuote.created_at)} ·{' '}
                        {selectedQuoteBusiness?.business_name ||
                          'Personal project'}
                      </DialogDescription>
                    </div>
                    {/* Clickable status control in top-left area of modal header */}
                    <div className="flex flex-col items-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`px-3 py-1 text-xs font-semibold ${
                              quoteStatusBadgeClassesLocal[
                                selectedQuote.status
                              ]
                            }`}
                            disabled={isUpdatingStatus}
                          >
                            {isUpdatingStatus
                              ? 'Updating...'
                              : statusLabel(selectedQuote.status)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            Set quote status
                          </DropdownMenuLabel>
                          {allStatuses.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() =>
                                handleStatusChange(
                                  selectedQuote.id,
                                  status
                                )
                              }
                            >
                              {statusLabel(status)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <p className="text-[10px] text-muted-foreground">
                        Admin-only • any status
                      </p>
                      {statusError && (
                        <p className="text-[10px] text-destructive max-w-xs text-right">
                          {statusError}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1 font-semibold">
                      {statusLabel(selectedQuote.status)}
                    </p>
                    <Badge
                      variant="outline"
                      className={`mt-2 ${
                        quoteStatusBadgeClasses[
                          selectedQuote.status
                        ] ?? ''
                      }`}
                    >
                      {statusLabel(selectedQuote.status)}
                    </Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated{' '}
                      {formatDate(
                        selectedQuote.updated_at
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase text-muted-foreground">
                      Budget
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedQuote.budget_range ||
                        'Not specified'}
                    </p>
                    {selectedQuote.estimated_cost && (
                      <p className="text-sm text-muted-foreground">
                        Estimate:{' '}
                        {selectedQuote.currency}{' '}
                        {selectedQuote.estimated_cost}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Requester
                    </p>
                    <p className="font-semibold">
                      {selectedQuoteOwner?.full_name ||
                        '—'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedQuoteOwner?.email || '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Business
                    </p>
                    <p className="font-semibold">
                      {selectedQuoteBusiness?.business_name ||
                        'No business on file'}
                    </p>
                    {selectedQuoteBusiness?.industry && (
                      <p className="text-sm text-muted-foreground">
                        {selectedQuoteBusiness.industry}
                      </p>
                    )}
                    {selectedQuoteBusiness?.business_type && (
                      <Badge
                        variant="outline"
                        className="mt-2 w-fit"
                      >
                        {
                          selectedQuoteBusiness.business_type
                        }
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">
                    Website Needs
                  </p>
                  <p className="text-sm whitespace-pre-line">
                    {selectedQuote.website_needs}
                  </p>
                </div>

                {selectedQuote.collaboration_preferences && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">
                      Collaboration Preferences
                    </p>
                    <p className="text-sm">
                      {
                        selectedQuote.collaboration_preferences
                      }
                    </p>
                  </div>
                )}

                {selectedQuote.suggested_collaboration && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">
                      Suggested Collaboration
                    </p>
                    <p className="text-sm whitespace-pre-line">
                      {
                        selectedQuote.suggested_collaboration
                      }
                    </p>
                  </div>
                )}

                {selectedQuote.ai_quote && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">
                      AI Quote
                    </p>
                    <p className="text-sm whitespace-pre-line">
                      {selectedQuote.ai_quote}
                    </p>
                  </div>
                )}

                {selectedQuoteSuggestions.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs uppercase text-muted-foreground">
                      AI Suggestions
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      {selectedQuoteSuggestions.map(
                        (suggestion, index) => (
                          <li
                            key={`suggestion-${index}`}
                          >
                            {typeof suggestion ===
                            'string'
                              ? suggestion
                              : JSON.stringify(
                                  suggestion
                                )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Admin Feedback to User
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share updates with the requester. Leave
                      blank to remove previous feedback.
                    </p>
                  </div>
                  <Textarea
                    value={feedbackDraft}
                    onChange={(event) =>
                      handleFeedbackDraftChange(
                        event.target.value
                      )
                    }
                    placeholder="Let the requester know what happens next..."
                    rows={4}
                  />
                  {feedbackError && (
                    <p className="text-sm text-destructive">
                      {feedbackError}
                    </p>
                  )}
                  {feedbackSuccess && (
                    <p className="text-sm text-emerald-600">
                      {feedbackSuccess}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleFeedbackDraftChange(
                          selectedQuote.admin_feedback ??
                            ''
                        )
                      }
                      disabled={isSavingFeedback}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleSaveFeedback}
                      disabled={isSavingFeedback}
                    >
                      {isSavingFeedback && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Admin Feedback
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border bg-background p-4 space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">
                    User Feedback to Admin
                  </p>
                  {selectedQuote.user_feedback ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedQuote.user_feedback}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The user has not left any feedback yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <UsersWithProposals
          users={data?.profiles || []}
          businesses={data?.businesses || []}
          quotes={data?.quotes || []}
          onQuoteView={openQuoteDialog}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  isLoading,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingTablePlaceholder({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map(
        (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid animate-pulse gap-4 rounded-md border bg-muted/30 p-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map(
              (_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 rounded bg-muted"
                />
              )
            )}
          </div>
        )
      )}
    </div>
  );
}

function LoadingListPlaceholder({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
          >
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-8 rounded bg-muted" />
          </div>
        )
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
