export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-4xl font-semibold tracking-tight">{slug.replaceAll('-', ' ')}</h1>
      <p className="max-w-3xl text-muted-foreground">
        Member profile pages combine biography, strengths, cohort participation, project contributions, and social/GitHub links.
      </p>
    </div>
  );
}
