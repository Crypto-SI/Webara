'use client';

import { RedirectToSignIn, useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
  adminFallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo,
  requireAdmin = false,
  adminFallback,
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    const redirectUrl =
      redirectTo ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    if (fallback) return <>{fallback}</>;
    return <RedirectToSignIn redirectUrl={redirectUrl} />;
  }

  const role = (user.publicMetadata?.role as string | undefined)?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'webara_staff';

  if (requireAdmin && !isAdmin) {
    return (
      adminFallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <Alert variant="destructive">
              <AlertDescription>
                You don&apos;t have permission to access this page. This area is restricted to administrators only.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              You&apos;ve been redirected to your profile dashboard.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export function AdminProtectedRoute({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      requireAdmin
      adminFallback={fallback}
      redirectTo="/profile"
    >
      {children}
    </ProtectedRoute>
  );
}
