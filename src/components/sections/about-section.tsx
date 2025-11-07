import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Award, Target, Users } from 'lucide-react';

export function AboutSection() {
  const aboutImage = PlaceHolderImages.find((p) => p.id === 'about-us-image');

  return (
    <section id="about" className="w-full py-20 md:py-28 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <div className="relative mx-auto max-w-md aspect-[4/5]">
            {aboutImage && (
              <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                fill
                className="rounded-lg object-cover shadow-lg"
                data-ai-hint={aboutImage.imageHint}
              />
            )}
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                About Us
              </span>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Crafting Digital Excellence
              </h2>
              <p className="max-w-prose text-foreground/80">
                Webara Studio is a passionate team of designers, developers, and
                strategists dedicated to creating impactful digital experiences.
                We believe in the power of collaboration and innovation to bring
                your vision to life.
              </p>
            </div>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Our Mission</h3>
                  <p className="text-foreground/70">
                    To empower businesses with technology and design that drives
                    growth and creates lasting value.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Our Team</h3>
                  <p className="text-foreground/70">
                    A diverse group of creative thinkers and problem solvers
                    united by a shared passion for excellence.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Our Approach</h3>
                  <p className="text-foreground/70">
                    We focus on partnership, transparency, and tailored
                    solutions to ensure your project's success.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-foreground p-6 text-background shadow-lg shadow-primary/10">
              <Image
                src="/webaralogo.png"
                alt="Webara Studio logo"
                width={200}
                height={60}
                className="h-10 w-auto"
              />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-background/80">
                Crafting Experiences Since 2016
              </p>
              <p className="mt-2 text-sm text-background/70">
                Our badge represents the balance of strategy, design, and engineering that powers every client engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
