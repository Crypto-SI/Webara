import Link from 'next/link';

import { Logo } from '@/components/logo';
import { utilityNav } from '@/lib/forge-content';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Logo />
          <p className="max-w-xl text-sm text-muted-foreground">
            Webara Forge is a selective hacker house and venture studio in Tema,
            Ghana. Startups are forged here.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {utilityNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/75 transition-colors hover:text-primary"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Webara Forge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
