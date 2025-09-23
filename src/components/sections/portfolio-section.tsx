import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export function PortfolioSection() {
  const portfolioImages = PlaceHolderImages.filter((p) =>
    p.id.startsWith('portfolio-')
  );

  return (
    <section id="portfolio" className="w-full py-20 md:py-28 lg:py-32 bg-card">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Our Portfolio
          </h2>
          <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
            Check out some of our recent projects that showcase our passion for
            design and technology.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {portfolioImages.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl"
            >
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.imageHint}
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">
                    {item.description}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    Web Development, UI/UX Design
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
