import Link from 'next/link';

const cohorts = [
  { slug: 'forge-cohort-01', name: 'Forge Cohort 01', status: 'Completed', dates: 'Jan–Apr 2026' },
  { slug: 'forge-cohort-02', name: 'Forge Cohort 02', status: 'Live', dates: 'May–Aug 2026' },
];

export default function CohortsPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Cohorts</h1>
        <p className="text-muted-foreground">A public archive of every Webara Forge cohort with teams, members, projects, and outcomes.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {cohorts.map((cohort) => (
          <Link key={cohort.slug} href={`/cohorts/${cohort.slug}`} className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">{cohort.status}</p>
            <h2 className="mt-2 text-xl font-semibold">{cohort.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{cohort.dates}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
