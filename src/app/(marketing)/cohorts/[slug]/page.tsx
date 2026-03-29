import Link from 'next/link';

export default async function CohortDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-4xl font-semibold tracking-tight">{slug.replaceAll('-', ' ')}</h1>
      <p className="max-w-3xl text-muted-foreground">
        Cohort detail pages are designed as the long-term proof-of-work archive for team output, member participation, demos, and outcomes.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {['Teams', 'Members', 'Projects'].map((label) => (
          <article key={label} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Structured relationships from CMS content will populate this section.</p>
          </article>
        ))}
      </div>
      <Link href="/apply" className="text-sm font-semibold text-primary">Apply for the next cohort →</Link>
    </div>
  );
}
