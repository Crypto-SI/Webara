'use client';

// src/app/signup/page.tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SignUp } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// NOTE: metadata export removed because this is a client component using Clerk.
// Define metadata in a server layout for (auth) if SEO control is needed.

export default function SignupPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main-centered">
        <Card className="page-card-auth responsive-card">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignUp routing="hash" />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
