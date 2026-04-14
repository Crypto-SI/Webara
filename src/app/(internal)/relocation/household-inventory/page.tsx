import { Plus } from 'lucide-react';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { StatusChip } from '@/components/relocation/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { inventoryItems, inventoryRooms } from '@/lib/relocation/mock-data';

export default function InventoryPage() {
  return (
    <RelocationShell title="Household Inventory">
      <div className="mb-4 flex justify-end">
        <Button><Plus className="mr-2 h-4 w-4" />Add item</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {inventoryRooms.map((room) => {
          const items = inventoryItems.filter((item) => item.room === room);
          return (
            <Card key={room}>
              <CardHeader><CardTitle className="text-base">{room}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">No items yet for this room.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-start gap-2">
                        <Checkbox id={item.id} defaultChecked={item.status === 'present'} className="mt-1" />
                        <div className="space-y-1">
                          <label htmlFor={item.id} className="text-sm font-medium">{item.itemName} (x{item.quantity})</label>
                          <StatusChip value={item.status} />
                          <p className="text-xs text-slate-500">{item.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </RelocationShell>
  );
}
