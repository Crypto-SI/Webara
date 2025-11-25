'use client';

// src/app/login/page.tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SignIn } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

// NOTE: metadata export removed because this is a client component using Clerk.
// Define metadata in a server layout for (auth) if SEO control is needed.

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('LoginPage: Component mounted on client');
  }, []);

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main-centered">
        <Card className="page-card-auth responsive-card">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isClient ? (
              <SignIn routing="hash" />
            ) : (
              <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg" />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
