"use client";
import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { useSimpleAuth } from '@/contexts/auth-context-simple';

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAdmin, signOut } = useSimpleAuth();
  const router = useRouter();
  const displayName =
    user?.user_metadata?.full_name?.toString() ||
    user?.email?.split('@')[0] ||
    'Account';
  const dashboardHref = isAdmin ? '/admin' : '/profile';

  const handleSignOut = useCallback(async () => {
    await signOut();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  }, [router, signOut]);

  const navLinks = [
    { href: '/#portfolio', label: 'Portfolio' },
    { href: '/#about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/#contact', label: 'Get a Quote' },
    { href: '/profile', label: 'My Profile'},
  ];

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href.startsWith('/#')) {
        const targetElement = document.querySelector(href.substring(1));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Fallback for when element is not on the current page
          router.push(href);
        }
    } else {
        router.push(href);
    }
    setIsOpen(false);
  };
  
  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith('/#')) {
        e.preventDefault();
        const targetElement = document.querySelector(href.substring(1));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Fallback for when element is not on the current page
          router.push(href);
        }
        setIsOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="relative text-sm font-medium text-foreground/70 transition-colors hover:text-foreground after:content-[''] after:absolute after:left-1/2 after:bottom-[-2px] after:h-[1.5px] after:w-0 after:bg-primary after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleSignOut();
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
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
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile navigation menu</SheetTitle>
                <SheetDescription>Select a destination to navigate</SheetDescription>
              </SheetHeader>
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
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {user ? (
                    <>
                      <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                        <Link href={dashboardHref}>Dashboard</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          void handleSignOut();
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
