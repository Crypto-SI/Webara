
// src/app/admin/new-post/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { createBlogPostAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const NewPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  summary: z.string().min(10, 'Summary must be at least 10 characters.'),
  author: z.string().min(2, 'Author name is required.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  imageHint: z.string().min(2, 'Image hint is required.'),
});

type NewPostValues = z.infer<typeof NewPostSchema>;

export default function NewPostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewPostValues>({
    resolver: zodResolver(NewPostSchema),
    defaultValues: {
      title: '',
      summary: '',
      author: '',
      content: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  async function onSubmit(values: NewPostValues) {
    setIsLoading(true);
    const result = await createBlogPostAction(values);

    if (result.success) {
      toast({
        title: 'Blog Post Created!',
        description: 'Your new blog post has been successfully saved.',
      });
      form.reset();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create blog post.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Create New Blog Post</CardTitle>
              <CardDescription>Fill out the form below to publish a new article to your blog.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., The Future of Web Design" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary / Snippet</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A short, catchy summary for the blog list page." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Write your full blog post content here. You can use line breaks." rows={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                     <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Author</FormLabel>
                            <FormControl>
                            <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                            <Input placeholder="https://images.unsplash.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                   <FormField
                        control={form.control}
                        name="imageHint"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image AI Hint</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'abstract design'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                    {isLoading ? <Loader2 className="animate-spin" /> : <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Publish Post
                    </>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
