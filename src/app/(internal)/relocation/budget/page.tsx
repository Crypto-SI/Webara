import { RelocationShell } from '@/components/relocation/relocation-shell';
import { StatusChip } from '@/components/relocation/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { budgetItems } from '@/lib/relocation/mock-data';

export default function BudgetPage() {
  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);
  const diff = totalPlanned - totalActual;
  const spendPercent = Math.round((totalActual / totalPlanned) * 100);

  return (
    <RelocationShell title="Budget">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Total planned</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">USD {totalPlanned.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Total actual</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">USD {totalActual.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-slate-500">Remaining difference</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">USD {diff.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Budget burn</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-slate-500"><span>Spend progress</span><span>{spendPercent}%</span></div>
          <Progress value={spendPercent} className="mt-2 h-3" />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Relocation costs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Item</TableHead><TableHead>Planned</TableHead><TableHead>Actual</TableHead><TableHead>Currency</TableHead><TableHead>Status</TableHead><TableHead>Due date</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {budgetItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.category}</TableCell><TableCell>{item.itemName}</TableCell><TableCell>{item.plannedCost}</TableCell><TableCell>{item.actualCost}</TableCell><TableCell>{item.currency}</TableCell><TableCell><StatusChip value={item.status} /></TableCell><TableCell>{item.dueDate}</TableCell><TableCell>{item.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
