import { ForgePage } from '@/components/sections/forge-page';

export default function AboutPage() {
  return (
    <ForgePage
      eyebrow="About"
      title="A selective venture platform built in Tema."
      intro="Webara Forge exists to compress years of learning into a focused 14-week operating environment for high-agency builders."
      sections={[
        {
          heading: 'What Webara Forge is',
          body: 'A hacker house and venture studio designed for serious teams that can build fast, validate rigorously, and execute with discipline.',
        },
        {
          heading: 'Why Tema, why Ghana',
          body: 'The Forge is grounded in local realities and national opportunity, while holding itself to global standards for speed and quality.',
        },
        {
          heading: 'Operating philosophy',
          body: 'Pressure creates signal. Teams are expected to ship, test assumptions, and make hard decisions based on evidence.',
          bullets: ['Build with urgency', 'Validate with users', 'Keep or kill based on signal'],
        },
      ]}
      ctas={[{ href: '/apply', label: 'Apply' }, { href: '/how-it-works', label: 'See the 14-week model', variant: 'outline' }]}
    />
  );
}
