'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useSimpleAuth, SimpleAuthProvider } from '@/contexts/auth-context-simple';
import { Logo } from '@/components/logo';
import type { Database } from '@/lib/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Loader2,
  LogOut,
  RefreshCw,
  Users as UsersIcon,
  Handshake,
  Settings,
  Shield,
} from 'lucide-react';
import { UsersWithProposals } from '@/components/admin/users-with-proposals';
import { UserDashboardSimple } from '@/components/profile/user-dashboard-simple';
import { AdminPanelSimple } from '@/components/profile/admin-panel-simple';
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];
type QuoteRow = Database['public']['Tables']['quotes']['Row'];

type ProfileDataPayload = {
  user: {
    id: string;
    email: string | null;
    fullName?: string | null;
    imageUrl?: string | null;
  };
  profile: ProfileRow | null;
  businesses: BusinessRow[];
  quotes: QuoteRow[];
};

export default function ProfilePage() {
  return (
    <ProfileGate>
      <ProfileContent />
    </ProfileGate>
  );
}

function ProfileGate({ children }: { children: ReactNode }) {
  const { user, loading, profile, refreshProfile } = useSimpleAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function ProfileContent() {
  const { user, profile, signOut } = useSimpleAuth();
  const router = useRouter();
  const [data, setData] = useState<ProfileDataPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const loadProfileData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/data', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || 'Failed to load profile data.');
      }

      const payload = (await response.json()) as ProfileDataPayload;
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
    loadProfileData();
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'webara_staff';

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

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <div className="border-b bg-background">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Logo className="w-fit rounded-full border border-border/70 bg-background px-4 py-2 shadow-sm transition hover:scale-105" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {
                  profile?.full_name ||
                    (user?.unsafeMetadata as { full_name?: string } | undefined)?.full_name ||
                    user?.emailAddresses?.[0]?.emailAddress ||
                    'Profile'
                }
              </h1>
              <p className="text-muted-foreground">
                Manage your profile and view your collaboration activity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={loadProfileData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Sign Out</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out and redirected to the landing page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} disabled={isSigningOut}>
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

      <div className="container mx-auto mt-8 px-4">
        {error && (
          <Card className="border-destructive/40 bg-destructive/10 text-destructive mb-6">
            <CardHeader>
              <CardTitle>Unable to load data</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className={cn(
              'grid w-full',
              isAdmin ? 'grid-cols-2' : 'grid-cols-1'
            )}
          >
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <UserDashboardSimple
              user={user!}
              profile={profile}
              businesses={data?.businesses || []}
              quotes={data?.quotes || []}
              isLoading={isLoading}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPanelSimple
                users={[]} // Will be populated by admin API
                businesses={[]} // Will be populated by admin API
                quotes={[]} // Will be populated by admin API
                isLoading={isLoading}
              />
            </TabsContent>
          )}
        </Tabs>
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your Clerk profile information.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 md:px-6">
              <ClerkUserProfile routing="hash" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
