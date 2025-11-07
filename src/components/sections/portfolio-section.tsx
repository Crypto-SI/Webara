import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PortfolioProject = {
  name: string;
  blurb: string;
  link: string;
  tags: string[];
  images: {
    src: string;
    alt: string;
  }[];
};

const projects: PortfolioProject[] = [
  {
    name: 'Affillia Sports',
    blurb:
      'Showcasing the professional football agency with an impressive stadium hero section and clean navigation.',
    link: 'https://affilliasports.com',
    tags: ['Sports Agency', 'Brand Experience', 'Responsive Web'],
    images: [
      { src: '/aff1.png', alt: 'Affillia Sports homepage hero' },
      { src: '/aff2.png', alt: 'Affillia Sports services layout' },
    ],
  },
  {
    name: 'Bidify',
    blurb:
      'Highlighting the vibrant NFT marketplace platform with orange gradient design and key features.',
    link: 'https://bidify.me',
    tags: ['NFT Marketplace', 'Product Design', 'Orange Gradient UI'],
    images: [
      { src: '/bid1.png', alt: 'Bidify landing page' },
      { src: '/bid2.png', alt: 'Bidify feature highlights' },
    ],
  },
  {
    name: 'Crypto Waffle',
    blurb:
      'Capturing the crypto podcast platform with its “Where Finance Meets Crypto” branding and show details.',
    link: 'https://cryptowaffle.fun',
    tags: ['Podcast Platform', 'Brand Identity', 'Audio Streaming UX'],
    images: [
      { src: '/waf1.png', alt: 'Crypto Waffle podcast overview' },
      { src: '/waf2.png', alt: 'Crypto Waffle episode detail' },
    ],
  },
  {
    name: 'AfroBall Connect',
    blurb:
      'Featuring the African football streaming platform with stunning savanna-themed design and key platform features.',
    link: 'https://afroballconnect.com',
    tags: ['Sports Streaming', 'Savanna Theme', 'OTT Experience'],
    images: [
      { src: '/afr1.png', alt: 'AfroBall Connect landing page' },
      { src: '/afr2.png', alt: 'AfroBall Connect platform features' },
    ],
  },
];

function PortfolioProjectCard({ project }: { project: PortfolioProject }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % project.images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [project.images.length]);

  const currentImage = project.images[currentIndex];

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
      <CardContent className="flex h-full flex-col p-0">
        <Link
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full flex-col"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              key={currentImage.src}
              src={currentImage.src}
              alt={currentImage.alt}
              width={800}
              height={600}
              className="h-full w-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-105"
            />
          </div>
          <div className="space-y-4 p-6">
            <div>
              <h3 className="text-xl font-semibold">{project.name}</h3>
              <p className="mt-2 text-sm text-foreground/70">{project.blurb}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="inline-flex items-center text-sm font-medium text-primary">
              Visit site
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export function PortfolioSection() {
  return (
    <section id="portfolio" className="w-full bg-card py-20 md:py-28 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Our Portfolio
          </h2>
          <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
            Explore a cross-section of platforms built for sport, Web3, media,
            and streaming—each tailored to its audience and growth goals.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {projects.map((project) => (
            <PortfolioProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
