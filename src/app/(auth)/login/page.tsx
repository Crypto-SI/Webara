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

// NOTE: metadata export removed because this is a client component using Clerk.
// Define metadata in a server layout for (auth) if SEO control is needed.

export default function LoginPage() {
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
            <SignIn routing="hash" />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
