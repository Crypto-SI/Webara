import Link from 'next/link';
import { ArrowRight, CalendarDays, FileCheck2, ShipWheel } from 'lucide-react';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  budgetItems,
  dashboardActivity,
  documents,
  familyMembers,
  healthcareEntries,
  housingOptions,
  schoolEntries,
  shippingQuotes,
  timelineTasks,
} from '@/lib/relocation/mock-data';

const quickLinks = [
  { href: '/relocation/documents', label: 'Review documents' },
  { href: '/relocation/moving-timeline', label: 'Open timeline board' },
  { href: '/relocation/budget', label: 'Check relocation budget' },
  { href: '/relocation/housing', label: 'Compare housing options' },
];

export default function RelocationDashboardPage() {
  const documentsCompleted = documents.filter((d) => d.status === 'approved' || d.status === 'received').length;
  const tasksDueSoon = timelineTasks.filter((task) => task.status !== 'done').slice(0, 3).length;
  const totalSchoolCost = schoolEntries.reduce((sum, entry) => sum + entry.feePerYear, 0);
  const budgetActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);

  const cards = [
    { label: 'Total family members', value: familyMembers.length },
    { label: 'Documents completed', value: `${documentsCompleted}/${documents.length}` },
    { label: 'Tasks due soon', value: tasksDueSoon },
    { label: 'Shipping quotes', value: shippingQuotes.length },
    { label: 'Housing options', value: housingOptions.length },
    { label: 'Yearly school costs', value: `$${totalSchoolCost.toLocaleString()}` },
    { label: 'Healthcare providers', value: healthcareEntries.length },
    { label: 'Current budget actual', value: `$${budgetActual.toLocaleString()}` },
  ];

  return (
    <RelocationShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="h-4 w-4" /> At a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timelineTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.category} • due {task.dueDate}</p>
                </div>
                <Button size="sm" variant="ghost">Open</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileCheck2 className="h-4 w-4" /> Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardActivity.map((activity) => (
              <p key={activity} className="rounded-lg bg-slate-50 p-2 text-sm text-slate-600">{activity}</p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><ShipWheel className="h-4 w-4" /> Quick links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
              <span className="inline-flex items-center gap-2">{link.label}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
