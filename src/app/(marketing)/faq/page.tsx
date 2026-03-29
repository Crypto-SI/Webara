const faqs = [
  'Who can apply to a cohort?',
  'Do applicants need to be technical?',
  'How does housing work?',
  'Can companies recruit from the Forge?',
  'What happens to projects after cohort completion?',
];

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-14 md:px-6 md:py-20">
      <h1 className="text-4xl font-semibold tracking-tight">FAQ</h1>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <article key={faq} className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{faq}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Answer content is managed as FAQ items so updates can happen without code changes.</p>
          </article>
        ))}
      </div>
    </div>
  );
}
