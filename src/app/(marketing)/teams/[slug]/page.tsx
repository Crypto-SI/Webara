export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Team: {slug.replaceAll('-', ' ')}</h1>
      <p className="max-w-3xl text-muted-foreground">
        Team pages document member composition, project sequence, sprint output, and validation outcomes within each cohort.
      </p>
    </div>
  );
}
