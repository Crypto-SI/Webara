import { ForgePage } from '@/components/sections/forge-page';

export default function HackathonPage() {
  return (
    <ForgePage
      eyebrow="Hackathon"
      title="National discovery engine for the next generation of builders."
      intro="The Webara Forge Hackathon identifies high-potential talent and channels top teams into long-term build environments."
      sections={[
        { heading: 'Who can enter', body: 'Students, early-career professionals, and independent builders across Ghana with real problem-solving ability.' },
        { heading: 'Why it matters', body: 'The hackathon bridges institutions, sponsors, and startup pathways into one transparent pipeline.' },
      ]}
      ctas={[{ href: '/contact', label: 'Sponsor the hackathon' }, { href: '/faq', label: 'Hackathon FAQ', variant: 'outline' }]}
    />
  );
}
