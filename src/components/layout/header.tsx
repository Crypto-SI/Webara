"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link href="#contact" onClick={(e) => handleScroll(e, '#contact')}>
            <Button>Get a Quote</Button>
          </Link>
        </div>
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Logo />
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleScroll(e, link.href)}
                      className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Link
                  href="#contact"
                  onClick={(e) => handleScroll(e, '#contact')}
                >
                  <Button className="w-full">Get a Quote</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
