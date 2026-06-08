'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'webara_newsletter_dismissed';
const SUBSCRIBED_KEY = 'webara_newsletter_subscribed';
const SHOW_DELAY = 8000; // 8 seconds after page load
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days before showing again

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Don't show if already subscribed
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;

    // Don't show if dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < DISMISS_DURATION) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, SHOW_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      localStorage.setItem(SUBSCRIBED_KEY, 'true');

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          {status === 'success' ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                You&apos;re in! 🎉
              </h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ll keep you posted on the latest from Webara Studio.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Stay in the loop
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get updates on new projects, launches, and insights from Webara Studio. No spam, ever.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="you@company.com"
                    required
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    disabled={status === 'submitting'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting' || !email}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {status === 'submitting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Join
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {status === 'error' && errorMessage && (
                  <p className="text-xs text-destructive">{errorMessage}</p>
                )}

                <p className="text-xs text-muted-foreground/60 text-center">
                  Unsubscribe anytime. We respect your inbox.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
