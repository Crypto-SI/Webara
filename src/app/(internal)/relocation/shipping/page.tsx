import { CheckCircle2 } from 'lucide-react';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { shippingQuotes } from '@/lib/relocation/mock-data';

export default function ShippingPage() {
  return (
    <RelocationShell title="Shipping">
      <div className="grid gap-4 lg:grid-cols-2">
        {shippingQuotes.map((quote) => (
          <Card key={quote.id} className={quote.bestValue ? 'border-emerald-300' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {quote.companyName}
                {quote.bestValue && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Best value</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Contact: {quote.contactName} • {quote.phone}</p>
              <p>Email: {quote.email}</p>
              <p>Quote: {quote.currency} {quote.quoteAmount.toLocaleString()}</p>
              <p>Type: {quote.shipmentType}</p>
              <p>Insurance: {quote.insuranceIncluded ? 'Included' : 'Not included'}</p>
              <p className="text-slate-500">{quote.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Quote comparison table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Collection</TableHead><TableHead>Estimated delivery</TableHead><TableHead>Shipment type</TableHead><TableHead>Included services</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              {shippingQuotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.companyName}</TableCell>
                  <TableCell>{q.collectionDate}</TableCell>
                  <TableCell>{q.estimatedDeliveryDate}</TableCell>
                  <TableCell>{q.shipmentType}</TableCell>
                  <TableCell className="max-w-72">{q.includedServices}</TableCell>
                  <TableCell>{q.currency} {q.quoteAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
