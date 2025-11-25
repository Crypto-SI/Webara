import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/layout/marketing-header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Case Studies | Webara Studio',
  description:
    'See how Webara Studio ships SaaS and B2B products: performance boosts, AI automations, and conversion gains across launches.',
  alternates: {
    canonical: 'https://webarastudio.com/case-studies',
  },
  openGraph: {
    title: 'Case Studies | Webara Studio',
    description:
      'Outcomes from recent SaaS and B2B launches—conversion wins, AI integrations, and performance improvements.',
    url: 'https://webarastudio.com/case-studies',
    type: 'article',
  },
};

const studies = [
  {
    title: 'Affillia Sports',
    summary: 'Modernized brand experience with faster LCP and streamlined signup flow.',
    tags: ['Sports Agency', 'Performance', 'Conversion'],
    outcomes: ['-36% LCP', '+18% signup rate', 'Unified design system'],
    link: 'https://affilliasports.com',
  },
  {
    title: 'Bidify',
    summary: 'NFT marketplace refresh with clearer value props and improved mobile UX.',
    tags: ['Marketplace', 'Web3', 'Mobile UX'],
    outcomes: ['+22% session depth', '+11% add-to-cart', 'Mobile-first layout'],
    link: 'https://bidify.me',
  },
  {
    title: 'AfroBall Connect',
    summary: 'Streaming experience tuned for engagement with AI-driven highlights.',
    tags: ['Streaming', 'AI', 'Engagement'],
    outcomes: ['-29% buffering complaints', '+15% trial conversions', 'AI highlight surfacing'],
    link: 'https://afroballconnect.com',
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1 py-14 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 space-y-12">
          <section className="space-y-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline">
              Case Studies
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-foreground/80 md:text-xl">
              Outcomes from recent SaaS and B2B engagements—performance wins, AI automations, and conversions that stick.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
              <Link href="/services" className="underline hover:text-primary">
                Explore services
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/pricing" className="underline hover:text-primary">
                See pricing
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/#contact" className="underline hover:text-primary">
                Start a project
              </Link>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {studies.map((study) => (
              <Card key={study.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">{study.title}</CardTitle>
                  <CardDescription>{study.summary}</CardDescription>
                  <div className="flex flex-wrap gap-2 pt-3">
                    {study.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-foreground/80">
                  <div className="space-y-1">
                    {study.outcomes.map((outcome) => (
                      <div key={outcome} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={study.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                  >
                    View live <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
