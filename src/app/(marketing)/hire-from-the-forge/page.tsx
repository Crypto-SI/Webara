import { ForgePage } from '@/components/sections/forge-page';

export default function HireFromForgePage() {
  return (
    <ForgePage
      eyebrow="Hiring"
      title="Hire operators trained in real startup pressure."
      intro="Companies can recruit product, engineering, and commercial talent with documented project execution history."
      sections={[
        { heading: 'Why Forge talent', body: 'Members are assessed through shipped products, sprint accountability, and customer validation work.' },
        { heading: 'How hiring works', body: 'Submit your role needs, review member profiles, and connect directly with shortlisted candidates.' },
      ]}
      ctas={[{ href: '/contact', label: 'Hire from the Forge' }, { href: '/members', label: 'Browse members', variant: 'outline' }]}
    />
  );
}
