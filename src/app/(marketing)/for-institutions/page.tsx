import { ForgePage } from '@/components/sections/forge-page';

export default function ForInstitutionsPage() {
  return (
    <ForgePage
      eyebrow="Institutions"
      title="Build a stronger venture talent pipeline with Webara Forge."
      intro="Universities and technical institutes can partner on hackathons, referrals, and practical venture exposure pathways."
      sections={[
        { heading: 'Partnership models', body: 'Co-host events, refer high-potential students, and align practical startup pathways with curriculum outcomes.' },
        { heading: 'Collaboration outcomes', body: 'Institutions gain a visible bridge from student talent to venture execution and employment pathways.' },
      ]}
      ctas={[{ href: '/contact', label: 'Partner as institution' }]}
    />
  );
}
