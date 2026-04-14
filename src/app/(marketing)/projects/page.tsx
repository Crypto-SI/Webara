import Link from 'next/link';

const projects = [
  { slug: 'signal-ledger', name: 'Signal Ledger', status: 'Live', cohort: 'Cohort 02' },
  { slug: 'market-route', name: 'Market Route', status: 'Continued', cohort: 'Cohort 01' },
  { slug: 'pilot-grid', name: 'Pilot Grid', status: 'Archived', cohort: 'Cohort 01' },
];

export default function ProjectsPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Filterable archive of products built through the Forge with status, cohort, and execution evidence.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.slug} href={`/projects/${project.slug}`} className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">{project.status}</p>
            <h2 className="mt-2 text-xl font-semibold">{project.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{project.cohort}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
