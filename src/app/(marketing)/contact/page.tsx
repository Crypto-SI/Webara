import Link from 'next/link';

const paths = ['Applications', 'Partnerships', 'Institutions', 'Companies', 'Media', 'Hackathon enquiries'];

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="text-muted-foreground">Use the structured enquiry flow to route your request to the right Webara Forge team.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {paths.map((path) => (
          <div key={path} className="rounded-lg border border-border bg-card p-4 text-sm font-medium">
            {path}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Need immediate support? Reach us via{' '}
        <Link href="mailto:hello@webaraforge.com" className="text-primary underline underline-offset-4">
          hello@webaraforge.com
        </Link>
        .
      </p>
    </div>
  );
}
