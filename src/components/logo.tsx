import { Cog } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="#"
      className={cn('flex items-center gap-2', className)}
      prefetch={false}
    >
      <Cog className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold tracking-tight font-headline text-foreground">
        <span className="text-accent">We</span>bara Studio
      </span>
    </Link>
  );
}
