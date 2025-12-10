'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  createTestProfile,
  deleteTestProfile,
  getTestProfileStatus,
  type TestProfileSeedSummary,
} from '@/app/actions';
import { TEST_PROFILE } from '@/lib/test-profile';
import { toast } from '@/hooks/use-toast';

type TestProfileStatus = NonNullable<
  Awaited<ReturnType<typeof getTestProfileStatus>>['data']
>;

const credentialItems = [
  { label: 'Email', value: TEST_PROFILE.email },
  { label: 'Name', value: TEST_PROFILE.name },
  { label: 'Password', value: TEST_PROFILE.password },
];

export function TestProfileSuite() {
  const [status, setStatus] = useState<TestProfileStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedSummary, setSeedSummary] = useState<TestProfileSeedSummary | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTestProfileStatus();
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.error ?? 'Unable to load test profile status.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load test profile status.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await createTestProfile();
      if (result.success && result.data) {
        toast({
          title: 'Test profile ready',
          description: result.data.message,
        });
        setSeedSummary(result.data.seedSummary);
        await refreshStatus();
      } else {
        const message = result.error ?? 'Unable to create test profile.';
        setError(message);
        setSeedSummary(null);
        toast({ title: 'Create failed', description: message, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      const message = 'Unable to create test profile.';
      setError(message);
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setError(null);
    try {
      const result = await deleteTestProfile();
      if (result.success) {
        toast({ title: 'Test profile cleared', description: 'Removed from Clerk and Supabase.' });
        setSeedSummary(null);
        await refreshStatus();
      } else {
        const message = result.error ?? 'Unable to clear test profile.';
        setError(message);
        toast({ title: 'Clear failed', description: message, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      const message = 'Unable to clear test profile.';
      setError(message);
      toast({ title: 'Clear failed', description: message, variant: 'destructive' });
    } finally {
      setIsClearing(false);
    }
  };

  const hasClerk = Boolean(status?.clerkUser);
  const hasProfile = Boolean(status?.profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
          Admin Test Suite
          <div className="flex items-center gap-2">
            <Badge variant={hasClerk ? 'default' : 'secondary'}>
              Clerk {hasClerk ? 'Ready' : 'Missing'}
            </Badge>
            <Badge variant={hasProfile ? 'default' : 'secondary'}>
              Supabase {hasProfile ? 'Ready' : 'Missing'}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Spin up a known Clerk/Supabase account for QA and remove it when finished.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {credentialItems.map((item) => (
            <div key={item.label} className="rounded-md border p-3">
              <p className="text-xs uppercase text-muted-foreground">{item.label}</p>
              <p className="font-mono text-sm break-all">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Clerk account</p>
            {status?.clerkUser ? (
              <div className="text-muted-foreground space-y-1 mt-1">
                <p>ID: {status.clerkUser.id}</p>
                <p>Email: {status.clerkUser.email}</p>
                <p>Created: {status.clerkUser.createdAt ?? 'Unknown'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1">No Clerk user found.</p>
            )}
          </div>

          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Supabase profile</p>
            {status?.profile ? (
              <div className="text-muted-foreground space-y-1 mt-1">
                <p>ID: {status.profile.id}</p>
                <p>Role: {status.profile.role}</p>
                <p>Updated: {status.profile.updated_at}</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1">No Supabase profile found.</p>
            )}
          </div>

          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Seeded data</p>
            <div className="text-muted-foreground space-y-1 mt-1">
              <p>Businesses: {status?.businessCount ?? 0}</p>
              <p>Quotes: {status?.quoteCount ?? 0}</p>
              {seedSummary && (
                <p>
                  Last run: {seedSummary.quotesCreated} new quote(s), total {seedSummary.totalQuotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {seedSummary && (
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Seed details</p>
            <div className="text-muted-foreground space-y-1 mt-1">
              <p>Business ID: {seedSummary.businessId ?? 'Unknown'}</p>
              <p>
                Business status: {seedSummary.businessCreated ? 'Created new record' : 'Already existed'}
              </p>
              <p>
                Quote IDs:{' '}
                {seedSummary.quoteIds.length > 0
                  ? seedSummary.quoteIds.join(', ')
                  : 'No new quotes created this run'}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreate} disabled={isCreating || isLoading}>
            {isCreating ? 'Creating...' : 'Create / Sync Test Profile'}
          </Button>
          <Button
            onClick={handleClear}
            variant="destructive"
            disabled={isClearing || isLoading}
          >
            {isClearing ? 'Clearing...' : 'Clear Test Profile'}
          </Button>
          <Button onClick={refreshStatus} variant="outline" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Creating a test profile provisions the Clerk user and the Supabase profile with the
          credentials shown above. Clearing removes the user, profile, quotes, and businesses tied
          to the account.
        </p>
      </CardContent>
    </Card>
  );
}
