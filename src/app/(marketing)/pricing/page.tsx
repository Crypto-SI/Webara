import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | Webara Studio',
  description:
    'Transparent pricing options for SaaS and B2B builds: fixed-scope MVPs, retainers, and profit-share partnerships with shared IP.',
  alternates: {
    canonical: 'https://webarastudio.com/pricing',
  },
  openGraph: {
    title: 'Pricing | Webara Studio',
    description:
      'Choose fixed-scope MVPs, retainers, or profit-share partnerships for your SaaS and B2B projects.',
    url: 'https://webarastudio.com/pricing',
    type: 'article',
  },
};

const tiers = [
  {
    name: 'Launch',
    price: 'Fixed-scope',
    description: 'For MVPs and campaigns that need to ship fast with clear scope.',
    points: [
      'Discovery + roadmap with risks and milestones',
      'Design + build + launch of core features/LP',
      'Analytics + funnels + activation instrumentation',
    ],
    cta: 'Start a project',
  },
  {
    name: 'Partner',
    price: 'Retainer',
    description: 'Ongoing product/design/engineering with weekly delivery.',
    points: [
      'Dedicated pod for design, engineering, and QA',
      'Weekly demos, backlog, and release cadence',
      'AI automations, performance, and SEO improvements',
    ],
    cta: 'Book a call',
  },
  {
    name: 'Profit-Share',
    price: 'Up to 100% off',
    description: 'Share new digital revenue in exchange for build discounts.',
    points: [
      'Co-ownership and shared IP where appropriate',
      'Aligned incentives tied to growth and conversion',
      'Ongoing optimization as revenue scales',
    ],
    cta: 'Explore options',
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-14 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 space-y-14">
          <section className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline">
              Pricing built for partnership
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-foreground/80 md:text-xl">
              Pick a model that fits your stage—fixed-scope launches, retained teams, or profit-share with shared upside. Transparency, weekly demos, and clear ownership.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/#contact">Get a quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">See services</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.name} className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-2 text-lg font-bold text-primary">{tier.price}</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm text-foreground/80">
                    {tier.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/#contact">{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">
                What’s included in every engagement
              </h2>
              <p className="text-lg text-foreground/80">
                Strategy + UX, engineering, QA, analytics, and deployment. AI where it drives ROI. Clear owners, SLAs where needed, and reliable ship rhythm.
              </p>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Roadmaps with risks and milestones</li>
                <li>• Design systems/components for velocity</li>
                <li>• Core Web Vitals and accessibility focus</li>
                <li>• Observability, alerts, and performance budgets</li>
              </ul>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <Link href="/blog" className="underline hover:text-primary">
                  Read build breakdowns
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="/#portfolio" className="underline hover:text-primary">
                  See recent launches
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="/services" className="underline hover:text-primary">
                  Explore services
                </Link>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">FAQs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-foreground/80">
                <p><strong>How do you price profit-share?</strong> We align on a revenue share for net-new digital revenue; deeper partnerships unlock more discount—up to fully funded builds.</p>
                <p><strong>Do we own the code?</strong> Yes. You own the code and IP; in profit-share models, we may share certain components where agreed.</p>
                <p><strong>Can you work with in-house teams?</strong> Yes. We slot into product/design/eng squads and keep joint rituals and demos.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
