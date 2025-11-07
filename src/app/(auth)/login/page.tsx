// src/app/login/page.tsx
'use client';
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

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="mx-auto max-w-sm w-full">
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
