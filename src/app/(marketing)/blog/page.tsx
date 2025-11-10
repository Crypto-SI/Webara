
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Blog | Webara Studio Insights on Modern Web, SaaS, and Product Design',
 description:
   'Read Webara Studio insights on Next.js, SaaS UX, high-converting landing pages, and collaborative product development.',
 alternates: {
   canonical: 'https://webarastudio.com/blog',
 },
 openGraph: {
   title: 'Webara Studio Blog | Insights on Modern Web & Product Design',
   description:
     'Expert articles on building scalable, conversion-focused digital experiences.',
   url: 'https://webarastudio.com/blog',
   type: 'website',
 },
};

// src/app/blog/page.tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { blogPosts, type BlogPost } from '@/lib/blog-posts';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BlogPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline">From the Blog</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Insights, tutorials, and thoughts on modern web design and development.
            </p>
          </div>

          <div className="grid gap-8">
            {blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} passHref>
                <Card className="group grid md:grid-cols-3 overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="md:col-span-1 relative h-60 md:h-full">
                     <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={post.imageHint}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit mb-2">
                        {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Badge>
                      <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 line-clamp-3">{post.summary}</CardDescription>
                       <div className="flex items-center justify-between">
                         <div className="text-sm text-muted-foreground">By {post.author}</div>
                         <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                       </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
