'use client';

import { Handshake, Lightbulb, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const highlights = [
  {
    icon: Handshake,
    title: 'Profit Share = Up to 100% Off',
    description:
      'Choose how much of your digital revenue you are happy to share with Webara. The deeper the partnership, the larger the discount—right up to a fully funded build.',
    badge: 'Flexible Terms',
  },
  {
    icon: Lightbulb,
    title: 'Tailored to Your Business',
    description:
      'From dog groomers and restaurants to SaaS and agencies, we shape the deal around your growth model. Local example: a grooming studio sharing 20% of online revenue pays £0 for their site.',
    badge: 'Real Examples',
  },
  {
    icon: ShieldCheck,
    title: 'Serious AI Integrations',
    description:
      'Automate bookings, staffing, marketing, and customer support with fully integrated AI workflows—built, trained, and maintained by our team.',
    badge: 'AI-Powered',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-background py-16 sm:py-20 md:py-24"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Profit-Share Partnership
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">
              How It Works
            </h2>
            <p className="text-lg text-foreground/80 md:text-xl">
              We build conversion-ready, AI-powered websites for forward-thinking
              teams. You decide how much of your new online revenue you want to
              profit-share—unlocking project discounts all the way to 100% off.
              It’s a collaborative model where success is shared.
            </p>
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-6 text-sm text-primary dark:text-primary-foreground">
              <strong className="block text-base font-semibold">
                Real-world example:
              </strong>
              A local dog grooming business partners with Webara, sharing 20% of
              revenue generated through the new site. They pay nothing upfront,
              launch with AI appointment scheduling and automated marketing, and
              both teams grow as bookings flood in. Win–win.
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <a href="#contact">Start a Conversation</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#portfolio">See What We Build</a>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="border-primary/10 bg-card/80 backdrop-blur transition-shadow hover:shadow-lg"
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <Badge variant="outline" className="text-xs uppercase">
                      {item.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
