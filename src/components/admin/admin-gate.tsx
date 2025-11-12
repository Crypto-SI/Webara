'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useSimpleAuth } from '@/contexts/auth-context-simple';

type AdminGateProps = {
  children: ReactNode;
};

export function AdminGate({ children }: AdminGateProps) {
  const { user, loading, profile, refreshProfile } = useSimpleAuth();
  const router = useRouter();
  const profileRole = profile?.role?.toLowerCase();
  const userRole = (user?.unsafeMetadata?.role as string | undefined)?.toLowerCase();
  const appRole = (user?.publicMetadata?.role as string | undefined)?.toLowerCase();
  const isAdmin = profileRole === 'admin' || userRole === 'admin' || appRole === 'admin';
  const attemptedRefreshRef = useRef(false);

  useEffect(() => {
    if (user && !profile && !loading && !attemptedRefreshRef.current) {
      attemptedRefreshRef.current = true;
      void refreshProfile();
    }
  }, [user, profile, loading, refreshProfile]);

  useEffect(() => {
    if (loading) return;
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
