import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { useSimpleAuth } from '@/contexts/auth-context-simple';

import type { AdminOverviewPayload, QuoteRow } from './types';

export function useAdminOverviewData() {
  const [data, setData] = useState<AdminOverviewPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/overview', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!body || Object.keys(body).length === 0) {
          throw new Error(`API returned status ${response.status} with no error message`);
        }
        throw new Error(body?.error || `API error: ${response.status}`);
      }

      const payload = (await response.json()) as AdminOverviewPayload;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error loading data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return { data, setData, isLoading, error, refresh: loadDashboard } as const;
}

export function useSignOutFlow() {
  const { signOut } = useSimpleAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
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
  }, [router, signOut]);

  return { isSigningOut, signOutDialogOpen, setSignOutDialogOpen, handleSignOut } as const;
}

export function useQuoteDialog(
  data: AdminOverviewPayload | null,
  setData: Dispatch<SetStateAction<AdminOverviewPayload | null>>
) {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRow | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

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

  const handleFeedbackDraftChange = (value: string) => {
    if (feedbackError) setFeedbackError(null);
    if (feedbackSuccess) setFeedbackSuccess(null);
    setFeedbackDraft(value);
  };

  const handleSaveFeedback = async () => {
    if (!selectedQuote) return;

    setIsSavingFeedback(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}/feedback`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: feedbackDraft }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; quote?: QuoteRow } | null;

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
          quotes: prev.quotes.map((quote) => (quote.id === body.quote!.id ? body.quote! : quote)),
        };
      });

      setSelectedQuote(body.quote);
      setFeedbackDraft(body.quote.admin_feedback ?? '');
      setFeedbackSuccess('Feedback saved successfully.');
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to save feedback.');
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const handleStatusChange = async (quoteId: string, nextStatus: QuoteRow['status']) => {
    if (!data || !selectedQuote || selectedQuote.id !== quoteId) return;

    setIsUpdatingStatus(true);
    setStatusError(null);

    const prevData = data;
    const prevSelected = selectedQuote;

    const optimisticallyUpdatedQuote: QuoteRow = {
      ...selectedQuote,
      status: nextStatus,
    };

    setSelectedQuote(optimisticallyUpdatedQuote);
    setData({
      ...data,
      quotes: data.quotes.map((quote) => (quote.id === quoteId ? { ...quote, status: nextStatus } : quote)),
    });

    try {
      const response = await fetch(`/api/admin/quotes/${encodeURIComponent(quoteId)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; quote?: QuoteRow } | null;

      if (!response.ok) {
        setData(prevData);
        setSelectedQuote(prevSelected);
        throw new Error(body?.error || 'Failed to update status.');
      }

      if (!body?.quote) {
        setData(prevData);
        setSelectedQuote(prevSelected);
        throw new Error('Status updated but response was incomplete.');
      }

      setData((current) =>
        current
          ? {
              ...current,
              quotes: current.quotes.map((quote) => (quote.id === body.quote!.id ? body.quote! : quote)),
            }
          : current
      );
      setSelectedQuote(body.quote);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      setStatusError(msg);
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return {
    isQuoteDialogOpen,
    selectedQuote,
    handleQuoteDialogChange,
    openQuoteDialog,
    feedbackDraft,
    handleFeedbackDraftChange,
    handleSaveFeedback,
    isSavingFeedback,
    feedbackError,
    feedbackSuccess,
    handleStatusChange,
    isUpdatingStatus,
    statusError,
  } as const;
}
