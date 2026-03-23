'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useSimpleAuth } from '@/contexts/auth-context-simple';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function syncProfileAfterLogin(accessToken?: string | null) {
  const response = await fetch('/api/auth/profile-sync', {
    method: 'POST',
    cache: 'no-store',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    profile?: { role?: string | null } | null;
  };
  return body.profile ?? null;
}

export default function LoginPage() {
  const { signIn } = useSimpleAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') || '/profile'
      : '/profile';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    const profile = await syncProfileAfterLogin(result.session?.access_token);
    const destination =
      profile?.role === 'admin' || profile?.role === 'webara_staff'
        ? '/admin'
        : redirect;

    router.replace(destination);
    router.refresh();
  };

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main-centered">
        <Card className="page-card-auth responsive-card">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Sign in with your Supabase-backed Webara account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Need an account? <Link href="/signup" className="underline">Create one</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
