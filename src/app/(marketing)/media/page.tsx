import Link from 'next/link';

const stories = [
  { slug: 'inside-the-forge-week-3', type: 'Build Diary' },
  { slug: 'cohort-01-demo-recap', type: 'Cohort Recap' },
  { slug: 'partner-interview-ecosystem', type: 'Interview' },
];

export default function MediaPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Media · Inside the Forge</h1>
        <p className="text-muted-foreground">Interviews, explainers, diaries, and recaps that make execution visible.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {stories.map((story) => (
          <Link key={story.slug} href={`/media/${story.slug}`} className="rounded-lg border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">{story.type}</p>
            <h2 className="mt-2 text-xl font-semibold">{story.slug.replaceAll('-', ' ')}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
