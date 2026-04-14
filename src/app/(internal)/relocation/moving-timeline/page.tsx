import { RelocationShell } from '@/components/relocation/relocation-shell';
import { StatusChip } from '@/components/relocation/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { timelineTasks } from '@/lib/relocation/mock-data';

export default function MovingTimelinePage() {
  const cols = ['not_started', 'in_progress', 'done'];

  return (
    <RelocationShell title="Moving Timeline">
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader><CardTitle>Checklist view</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {timelineTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{task.title}</p>
                    <StatusChip value={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{task.category} • Due {task.dueDate} • Assigned to {task.assignedPerson}</p>
                  <div className="mt-2"><Badge variant="outline">Priority: {task.priority}</Badge></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid gap-4 md:grid-cols-3">
            {cols.map((col) => (
              <Card key={col}>
                <CardHeader><CardTitle className="capitalize">{col.replace('_', ' ')}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {timelineTasks.filter((t) => t.status === col).map((task) => (
                    <div key={task.id} className="rounded-lg border border-slate-200 p-2 text-sm">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-slate-500">{task.dueDate}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader><CardTitle>Timeline milestones</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 border-l border-slate-200 pl-4">
                {timelineTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-900" />
                    <p className="text-sm text-slate-500">{task.dueDate}</p>
                    <p className="font-medium">{task.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </RelocationShell>
  );
}
