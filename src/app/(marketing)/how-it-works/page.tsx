import { ForgePage } from '@/components/sections/forge-page';

export default function HowItWorksPage() {
  return (
    <ForgePage
      eyebrow="Model"
      title="A 14-week system for building under pressure."
      intro="Each cohort follows a clear operating cadence from orientation to demo week, with evidence-based continuation decisions."
      sections={[
        {
          heading: 'Cohort sequence',
          body: 'Week 1 orientation, Validation Round 1, Sprint 1, Validation Round 2, Sprint 2, and Demo Week.',
        },
        {
          heading: 'Team composition',
          body: 'Teams typically include product, technical, and commercial operators to keep execution balanced.',
          bullets: ['Product / PM', 'Engineering', 'Sales or growth operator'],
        },
        {
          heading: 'Continue / Park / Kill',
          body: 'Projects are assessed frequently and routed based on traction evidence, not sentiment.',
        },
      ]}
      ctas={[{ href: '/cohorts', label: 'View cohorts' }, { href: '/projects', label: 'Explore outputs', variant: 'outline' }]}
    />
  );
}
