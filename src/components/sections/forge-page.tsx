import Link from 'next/link';

import { Button } from '@/components/ui/button';

type ForgePageProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string;
    bullets?: string[];
  }>;
  ctas?: Array<{ href: string; label: string; variant?: 'default' | 'outline' }>;
};

export function ForgePage({
  eyebrow,
  title,
  intro,
  sections,
  ctas = [],
}: ForgePageProps) {
  return (
    <div className="container mx-auto max-w-7xl space-y-10 px-4 py-14 md:px-6 md:py-20">
      <header className="max-w-3xl space-y-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground md:text-lg">{intro}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.heading} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
            {section.bullets?.length ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground/85">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      {ctas.length ? (
        <div className="flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Button key={cta.href} asChild variant={cta.variant ?? 'default'}>
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
