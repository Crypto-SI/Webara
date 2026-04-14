export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-4xl font-semibold tracking-tight">{slug.replaceAll('-', ' ')}</h1>
      <p className="max-w-3xl text-muted-foreground">
        This project page captures the problem, team, build milestones, validation evidence, repository links, and next disposition.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {['Problem and target users', 'What was built', 'Traction signal', 'Next step'].map((label) => (
          <article key={label} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">CMS-backed content placeholder for launch-phase samples and later archived cohorts.</p>
          </article>
        ))}
      </div>
    </div>
  );
}
