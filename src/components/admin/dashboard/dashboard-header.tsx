import Link from 'next/link';
import { Logo } from '@/components/logo';
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
import { Loader2, LogOut, RefreshCw } from 'lucide-react';

type DashboardHeaderProps = {
  isLoading: boolean;
  onRefresh: () => void;
  signOutDialogOpen: boolean;
  setSignOutDialogOpen: (open: boolean) => void;
  handleSignOut: () => void;
  isSigningOut: boolean;
};

export function DashboardHeader({
  isLoading,
  onRefresh,
  signOutDialogOpen,
  setSignOutDialogOpen,
  handleSignOut,
  isSigningOut,
}: DashboardHeaderProps) {
  return (
    <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:py-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <Logo className="w-fit rounded-full border border-border/70 bg-background px-3 py-1.5 shadow-sm transition hover:scale-105" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
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
          onClick={onRefresh}
          disabled={isLoading}
          className="w-full xs:w-auto sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full xs:w-auto sm:w-auto">
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dialog-responsive">
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be returned to the landing page. Any unsaved work will be lost.
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
  );
}
