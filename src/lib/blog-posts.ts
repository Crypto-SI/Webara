
import data from './blog-posts.json';

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  content: string;
};

export const blogPosts: BlogPost[] = data.blogPosts;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
