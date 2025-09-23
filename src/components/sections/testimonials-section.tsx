
'use client';

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = [
  {
    id: 'testimonial-sarah',
    name: 'Sarah Johnson',
    title: 'CEO, Innovate Inc.',
    quote:
      "Webara Studio transformed our online presence. Their attention to detail and creative approach resulted in a website that not only looks fantastic but also performs flawlessly. We couldn't be happier with the outcome.",
  },
  {
    id: 'testimonial-michael',
    name: 'Michael Thompson',
    title: 'Marketing Director, FutureGadget',
    quote:
      'Working with Webara Studio was a seamless experience from start to finish. They understood our vision and delivered a product that exceeded our expectations. Highly recommended!',
  },
  {
    id: 'testimonial-emily',
    name: 'Emily Rodriguez',
    title: 'Founder, The Bloom Co.',
    quote:
      'As a small business owner, I was looking for a team that could bring my brand to life online. Webara Studio did just that and more. Their team is professional, creative, and truly cares about their clients.',
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full py-20 md:py-28 lg:py-32"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl font-headline">
            What Our Clients Say
          </h2>
          <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
            We are proud of the relationships we build.
          </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="mx-auto w-full max-w-4xl"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => {
              const image = PlaceHolderImages.find(
                (p) => p.id === testimonial.id
              );
              return (
                <CarouselItem key={testimonial.id}>
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
                        <div className="mb-4">
                          {image && (
                            <Image
                              src={image.imageUrl}
                              alt={image.description}
                              width={80}
                              height={80}
                              className="rounded-full object-cover border-4 border-primary"
                              data-ai-hint={image.imageHint}
                            />
                          )}
                        </div>
                        <blockquote className="max-w-2xl text-lg font-medium text-foreground/90">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="mt-6">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-primary">
                            {testimonial.title}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="carousel-nav-button left-[-1rem] md:left-[-3rem]" />
          <CarouselNext className="carousel-nav-button right-[-1rem] md:right-[-3rem]" />
        </Carousel>
      </div>
    </section>
  );
}
