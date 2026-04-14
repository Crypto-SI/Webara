import { ForgePage } from '@/components/sections/forge-page';

export default function PartnersPage() {
  return (
    <ForgePage
      eyebrow="Partners"
      title="A structured partnership layer for execution-minded institutions."
      intro="Webara Forge collaborates with academic, ecosystem, challenge, technical, media, and hiring partners."
      sections={[
        { heading: 'Partnership categories', body: 'Academic partners, hiring partners, technical platforms, challenge sponsors, and ecosystem operators each have clear engagement paths.' },
        { heading: 'Ways to engage', body: 'Submit problems, sponsor cohort challenges, support hackathons, or recruit directly from member profiles.' },
      ]}
      ctas={[{ href: '/contact', label: 'Partner with Webara Forge' }, { href: '/hire-from-the-forge', label: 'Hire from the Forge', variant: 'outline' }]}
    />
  );
}
