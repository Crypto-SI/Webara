import type { Metadata } from 'next';

// src/app/privacy-policy/page.tsx
export const metadata: Metadata = {
  title: 'Privacy Policy | Webara Studio',
  description:
    'Read the Webara Studio privacy policy to understand how we collect, use, and protect your data.',
  alternates: {
    canonical: 'https://webarastudio.com/privacy-policy',
  },
};

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground/80">
              <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>
                  Welcome to Webara Studio. We are committed to protecting your privacy. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when you visit our website.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                <p>
                  We may collect personal information such as your name, email address, and project details when you fill out
                  our quote form. We also collect non-personal information, such as browser type and operating system, to improve
                  our service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide and maintain our services.</li>
                  <li>Generate quotes and collaboration suggestions.</li>
                  <li>Communicate with you about your project.</li>
                  <li>Improve our website and services.</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">4. Data Security</h2>
                <p>
                  We implement a variety of security measures to maintain the safety of your personal information. However, no
                  method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">5. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through the form on our homepage.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
