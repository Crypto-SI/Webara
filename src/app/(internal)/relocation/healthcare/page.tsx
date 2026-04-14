import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { healthcareEntries } from '@/lib/relocation/mock-data';

export default function HealthcarePage() {
  return (
    <RelocationShell title="Healthcare">
      <Card>
        <CardHeader><CardTitle>Healthcare by family member</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Doctor</TableHead><TableHead>Address</TableHead><TableHead>Fee</TableHead><TableHead>Contact</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {healthcareEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.personName}</TableCell>
                  <TableCell>{entry.doctorName}</TableCell>
                  <TableCell>{entry.address}</TableCell>
                  <TableCell>USD {entry.fee}</TableCell>
                  <TableCell>{entry.contactDetails}</TableCell>
                  <TableCell className="max-w-56 text-slate-600">{entry.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
