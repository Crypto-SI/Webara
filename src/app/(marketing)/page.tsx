import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ctaLinks } from '@/lib/forge-content';

const highlights = [
  '14-week live-in cohort model with validation rounds, sprint cycles, and demo week.',
  'Selective admissions designed for ambitious builders, operators, and founders.',
  'Public proof-of-work archive across cohorts, projects, members, and media.',
];

export default function Home() {
  return (
    <>
        <section className="border-b border-border">
          <div className="container mx-auto max-w-7xl space-y-8 px-4 py-20 md:px-6 md:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Webara Forge · Tema, Ghana
            </p>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-6xl">
              Startups are forged here.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              A selective hacker house and venture studio where small teams build
              under pressure, validate quickly, and turn signal into enduring
              companies.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/apply">Apply</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">Explore Projects</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item} className="rounded-lg border border-border bg-card p-6 text-sm leading-6 text-foreground/90">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto max-w-7xl space-y-6 px-4 pb-20 md:px-6">
          <h2 className="text-2xl font-semibold">Key journeys</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {ctaLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border bg-card p-6 text-lg font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
    </>
  );
}
