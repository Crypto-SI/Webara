import Link from 'next/link';

const members = [
  { slug: 'ama-boateng', name: 'Ama Boateng', role: 'Product Operator' },
  { slug: 'kwesi-mensah', name: 'Kwesi Mensah', role: 'Founding Engineer' },
  { slug: 'nana-adjei', name: 'Nana Adjei', role: 'Sales Builder' },
];

export default function MembersPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Members</h1>
        <p className="text-muted-foreground">Profile archive that demonstrates talent density across cohorts and operating roles.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {members.map((member) => (
          <Link key={member.slug} href={`/members/${member.slug}`} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{member.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{member.role}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
