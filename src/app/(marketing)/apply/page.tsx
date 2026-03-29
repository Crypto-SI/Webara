import { ForgePage } from '@/components/sections/forge-page';

export default function ApplyPage() {
  return (
    <ForgePage
      eyebrow="Apply"
      title="For serious builders only."
      intro="Webara Forge is selective by design. The process screens for commitment, execution speed, and ability to operate under pressure."
      sections={[
        { heading: 'Who should apply', body: 'Ambitious product, engineering, and commercial operators who want to build companies in a high-accountability environment.' },
        { heading: 'What is provided', body: 'A live-in operating environment with structured build cycles, mentorship access, and a focused peer group.' },
        { heading: 'Selection process', body: 'Application review, interviews, and practical assessment before cohort placement.' },
      ]}
      ctas={[{ href: '/contact', label: 'Start application' }]}
    />
  );
}
