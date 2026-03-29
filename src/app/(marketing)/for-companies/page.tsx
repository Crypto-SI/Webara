import { ForgePage } from '@/components/sections/forge-page';

export default function ForCompaniesPage() {
  return (
    <ForgePage
      eyebrow="Companies"
      title="Work with the Forge to solve real operating problems."
      intro="SMEs, startups, and larger companies can submit problems, sponsor challenges, and recruit verified talent."
      sections={[
        { heading: 'Engagement paths', body: 'Submit a challenge, sponsor a sprint track, partner with a cohort, or recruit directly from the talent archive.' },
        { heading: 'Value to companies', body: 'Get access to fast-moving teams and a disciplined execution framework that prioritizes measurable outcomes.' },
      ]}
      ctas={[{ href: '/contact', label: 'Submit a company problem' }]}
    />
  );
}
