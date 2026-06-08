import Link from 'next/link';
import { ArrowUpRight, BookOpenCheck, SearchCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const researchUrl = 'https://research.webarastudio.com/';

const researchHighlights = [
  {
    icon: SearchCheck,
    title: 'Market signals',
    description: 'Clear research notes on trends, tools, and digital growth opportunities.',
    image: '/research/market-signals-card.webp',
  },
  {
    icon: BookOpenCheck,
    title: 'Practical insight',
    description: 'Short reads built to help teams make better website and product decisions.',
    image: '/research/practical-insight-card.webp',
  },
  {
    icon: Sparkles,
    title: 'AI and web strategy',
    description: 'Ideas from our ongoing work across automation, UX, and conversion-focused builds.',
    image: '/research/ai-web-strategy-card.webp',
  },
];

export function ResearchSection() {
  return (
    <section id="research" className="w-full bg-background py-20 md:py-28 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 rounded-lg border bg-card p-6 shadow-sm md:grid-cols-[1fr_1.1fr] md:p-10 lg:p-12">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Webara Research
            </Badge>
            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Explore our latest digital research
              </h2>
              <p className="max-w-prose text-foreground/80 md:text-lg">
                Visit Webara Research for focused insights on websites, AI,
                automation, and the decisions behind stronger digital products.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href={researchUrl} target="_blank" rel="noopener noreferrer">
                Visit Webara Research
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {researchHighlights.map((item) => (
              <article
                key={item.title}
                className="relative min-h-48 overflow-hidden rounded-lg border border-primary/10 bg-background p-5 text-white shadow-sm"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(5, 12, 18, 0.9), rgba(5, 12, 18, 0.64), rgba(5, 12, 18, 0.2)), url(${item.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-white/80">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
