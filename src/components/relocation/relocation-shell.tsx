'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Bell,
  BookOpen,
  ClipboardList,
  DollarSign,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  School,
  Ship,
  StickyNote,
  Users,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { timelineTasks, moveDate } from '@/lib/relocation/mock-data';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/relocation', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/relocation/family-members', label: 'Family Members', icon: Users },
  { href: '/relocation/documents', label: 'Documents', icon: FileText },
  { href: '/relocation/moving-timeline', label: 'Moving Timeline', icon: ClipboardList },
  { href: '/relocation/shipping', label: 'Shipping', icon: Ship },
  { href: '/relocation/housing', label: 'Housing', icon: Home },
  { href: '/relocation/household-inventory', label: 'Household Inventory', icon: Package },
  { href: '/relocation/schooling', label: 'Schooling', icon: School },
  { href: '/relocation/healthcare', label: 'Healthcare', icon: HeartPulse },
  { href: '/relocation/budget', label: 'Budget', icon: DollarSign },
  { href: '/relocation/miscellaneous-notes', label: 'Miscellaneous Notes', icon: StickyNote },
] as const;

function daysUntil(target: string) {
  const today = new Date();
  const date = new Date(target);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-950 px-3 py-5 text-slate-100">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">RelocateGH</p>
        <h2 className="mt-1 text-lg font-semibold">Family Move Hub</h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-emerald-500/15 text-emerald-200'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
        <p className="font-medium text-white">Move support status</p>
        <p className="mt-1 text-slate-400">Backend ready structure with mock data mode.</p>
      </div>
    </div>
  );
}

export function RelocationShell({ children, title }: { children: ReactNode; title: string }) {
  const urgent = timelineTasks.filter((task) => task.priority === 'High' && task.status !== 'done').length;
  const overdue = timelineTasks.filter((task) => task.status === 'overdue').length;
  const done = timelineTasks.filter((task) => task.status === 'done').length;
  const progress = Math.round((done / timelineTasks.length) * 100);

  return (
    <div className="min-h-screen bg-slate-100/70">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 lg:block">
          <SidebarContent />
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 border-none p-0">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Relocation dashboard</p>
                  <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Export snapshot</Button>
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800">Add update</Button>
                <Button size="icon" variant="ghost"><Bell className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="sticky top-16 z-30 border-t border-slate-200 bg-white px-4 py-3 lg:px-8">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Move date countdown</p>
                  <p className="text-lg font-semibold text-slate-900">{daysUntil(moveDate)} days</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Overall progress</p>
                    <span className="text-xs font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="mt-2 h-2" />
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Next urgent tasks</p>
                  <p className="text-lg font-semibold text-amber-600">{urgent}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Overdue items</p>
                  <Badge variant="destructive" className="mt-1">{overdue} attention needed</Badge>
                </div>
              </div>
            </div>
          </header>
          <div className="px-4 py-6 lg:px-8">
            {children}
            <Separator className="my-8" />
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <BookOpen className="mb-2 h-4 w-4" />
              Future Supabase mapping plan is included in the codebase via relocation table schema definitions.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
