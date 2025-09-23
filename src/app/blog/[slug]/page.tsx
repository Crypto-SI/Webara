
// src/app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getPostBySlug, blogPosts } from '@/lib/blog-posts';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// This function generates the static paths for each blog post
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <article className="space-y-8">
            <div className="space-y-4">
                 <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                </Link>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                 <Badge variant="secondary">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Badge>
                <span>By {post.author}</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
                {post.title}
              </h1>
            </div>
            
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint={post.imageHint}
                priority
              />
            </div>
            
            <div 
              className="prose prose-lg prose-invert max-w-none text-foreground/80"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} 
            />

            <Separator />

            <div className="text-center">
                <Link href="/#contact">
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-semibold">
                        Ready to Start a Project? Get a Quote
                    </button>
                </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
