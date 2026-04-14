import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { schoolEntries } from '@/lib/relocation/mock-data';

export default function SchoolingPage() {
  return (
    <RelocationShell title="Schooling">
      <div className="grid gap-4 lg:grid-cols-2">
        {schoolEntries.map((school) => (
          <Card key={school.id}>
            <CardHeader><CardTitle className="text-base">{school.childName} • {school.schoolName}</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{school.address}</p>
              <p>Contact: {school.contactName} • {school.contactDetails}</p>
              <p>Year group: {school.yearGroup}</p>
              <p>Application status: {school.applicationStatus}</p>
              <p>Fee/year: USD {school.feePerYear.toLocaleString()}</p>
              <p>Distance from home: {school.distanceFromHome}</p>
              <p className="text-slate-500">{school.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </RelocationShell>
  );
}
