'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { syncClerkUser } from '@/app/actions';
import { toast } from '@/hooks/use-toast';

interface SyncClerkButtonProps {
  userId: string;
  userName?: string;
  onSyncComplete?: (success: boolean) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SyncClerkButton({
  userId,
  userName,
  onSyncComplete,
  variant = 'outline',
  size = 'sm',
  className = '',
}: SyncClerkButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      try {
        const result = await syncClerkUser(userId);
        
        if (result.success) {
          toast({
            title: "User Synced Successfully",
            description: `Successfully synced ${userName || 'user'} from Clerk to Supabase.`,
          });
          onSyncComplete?.(true);
        } else {
          toast({
            title: "Sync Failed",
            description: result.error || "Failed to sync user from Clerk to Supabase.",
            variant: "destructive",
          });
          onSyncComplete?.(false);
        }
      } catch (error) {
        toast({
          title: "Sync Failed",
          description: "An unexpected error occurred while syncing the user.",
          variant: "destructive",
        });
        onSyncComplete?.(false);
      }
    });
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isPending}
      variant={variant}
      size={size}
      className={`px-3 py-2 ${variant === 'outline' ? 'bg-amber-500 text-slate-900 hover:bg-amber-600' : ''} ${className}`}
    >
      {isPending ? 'Syncing…' : 'Sync from Clerk'}
    </Button>
  );
}