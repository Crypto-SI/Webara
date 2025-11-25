import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Check, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'SaaS & B2B Services | Webara Studio',
  description:
    'See how Webara Studio co-builds SaaS and B2B products: product strategy, design, engineering, and AI automations with transparent retainers.',
  alternates: {
    canonical: 'https://webarastudio.com/services',
  },
  openGraph: {
    title: 'SaaS & B2B Services | Webara Studio',
    description:
      'From MVP to growth: strategy, UX, engineering, and AI automations built in partnership.',
    url: 'https://webarastudio.com/services',
    type: 'article',
  },
};

const services = [
  {
    icon: Rocket,
    title: 'MVP & Product Launch',
    points: [
      'Discovery, scoping, and risk mapping to ship fast',
      'High-converting marketing site aligned to launch',
      'Analytics, funnels, and activation setup on day one',
    ],
  },
  {
    icon: Sparkles,
    title: 'AI Automations',
    points: [
      'Booking, support, and ops automations tailored to your flows',
      'Data and tool integrations for CRM, billing, and notifications',
      'Guardrails and monitoring so AI stays reliable in production',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Reliability & Performance',
    points: [
      'Core Web Vitals optimization for SEO and conversion',
      'Design systems and component libraries for velocity',
      'Security, auth, and compliance-minded workflows',
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-14 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 space-y-16">
          <section className="text-center space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline">
              SaaS & B2B Services
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-foreground/80 md:text-xl">
              We co-build products with founders and marketing leaders—combining strategy, UX, engineering, and AI automations so you can launch fast and scale with confidence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/#contact">Get a project quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#portfolio">See recent launches</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="h-full">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-foreground/80">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">
                Engagement Options
              </h2>
              <p className="text-lg text-foreground/80">
                Choose what fits your stage: fixed-scope MVPs, retained product teams, or profit-share partnerships with shared IP. Transparent pricing and weekly demos keep delivery accountable.
              </p>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-1" />
                  <span>Roadmapping sprints with clear milestones and risks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-1" />
                  <span>Design systems and component libraries to move fast</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-1" />
                  <span>Conversion-focused pages that align with paid and organic funnels</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/blog" className="underline hover:text-primary text-sm font-semibold">
                  Read our build breakdowns
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="/#contact" className="underline hover:text-primary text-sm font-semibold">
                  Talk to the team
                </Link>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  What success looks like
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-foreground/80">
                <p>✔ Faster LCP and better Core Web Vitals for SEO and conversions.</p>
                <p>✔ Funnels wired for analytics, experimentation, and activation.</p>
                <p>✔ AI-powered workflows that reduce manual ops and support volume.</p>
                <p>✔ Ship rhythm: weekly demos, transparent backlog, reliable releases.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
