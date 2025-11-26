'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { syncClerkUser, syncAllClerkUsers, getClerkUsersNotInProfiles } from '@/app/actions';
import { toast } from '@/hooks/use-toast';

interface MissingUser {
  id: string;
  email: string | null;
  name: string;
}

export function ClerkSyncPanel() {
  const [missingUsers, setMissingUsers] = useState<MissingUser[]>([]);
  const [isLoadingMissing, setIsLoadingMissing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadMissingUsers = async () => {
    setIsLoadingMissing(true);
    setError(null);
    try {
      const result = await getClerkUsersNotInProfiles();
      if (result.success) {
        setMissingUsers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load missing users');
    } finally {
      setIsLoadingMissing(false);
    }
  };

  useEffect(() => {
    loadMissingUsers();
  }, []);

  const handleSyncUser = async (userId: string) => {
    setSyncingUserId(userId);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await syncClerkUser(userId);
      if (result.success) {
        setSuccess(`Successfully synced user: ${result.data?.full_name || userId}`);
        toast({
          title: "User Synced",
          description: `Successfully synced user: ${result.data?.full_name || userId}`,
        });
        // Refresh missing users list
        await loadMissingUsers();
      } else {
        setError(result.error);
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync user",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMsg = 'Failed to sync user';
      setError(errorMsg);
      toast({
        title: "Sync Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSyncingUserId(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await syncAllClerkUsers();
      if (result.success) {
        setSuccess(`Successfully synced ${result.data?.synced || 0} users`);
        toast({
          title: "Bulk Sync Complete",
          description: `Successfully synced ${result.data?.synced || 0} users`,
        });
        // Refresh missing users list
        await loadMissingUsers();
      } else {
        setError(result.error);
        toast({
          title: "Bulk Sync Failed",
          description: result.error || "Failed to sync users",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMsg = 'Failed to sync all users';
      setError(errorMsg);
      toast({
        title: "Bulk Sync Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Clerk User Sync
          <Badge variant={missingUsers.length > 0 ? "destructive" : "secondary"}>
            {missingUsers.length} Missing
          </Badge>
        </CardTitle>
        <CardDescription>
          Sync Clerk users to Supabase profiles table. Users missing from profiles will be shown below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSyncAll}
            disabled={isSyncingAll || isLoadingMissing}
            variant="default"
            className="flex-1"
          >
            {isSyncingAll ? 'Syncing All Users...' : 'Sync All Clerk Users'}
          </Button>
          
          <Button
            onClick={loadMissingUsers}
            disabled={isLoadingMissing}
            variant="outline"
          >
            {isLoadingMissing ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {missingUsers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Missing Users ({missingUsers.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {missingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                  </div>
                  <Button
                    onClick={() => handleSyncUser(user.id)}
                    disabled={syncingUserId === user.id || isSyncingAll}
                    size="sm"
                    variant="outline"
                  >
                    {syncingUserId === user.id ? 'Syncing...' : 'Sync'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {missingUsers.length === 0 && !isLoadingMissing && (
          <div className="text-center py-4 text-muted-foreground">
            <p>All Clerk users are synced to Supabase profiles.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}