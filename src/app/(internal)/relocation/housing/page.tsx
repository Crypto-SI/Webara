import Link from 'next/link';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { housingOptions } from '@/lib/relocation/mock-data';

export default function HousingPage() {
  return (
    <RelocationShell title="Housing">
      <div className="grid gap-4 md:grid-cols-2">
        {housingOptions.map((house) => (
          <Card key={house.id}>
            <CardHeader><CardTitle className="text-base">{house.propertyTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{house.location} • {house.postcode}</p>
              <p>{house.currency} {house.rent}/month • {house.numberOfRooms} rooms</p>
              <p>Deposit: {house.currency} {house.depositAmount}</p>
              <p>{house.furnishedStatus}</p>
              <p className="text-slate-500">{house.notes}</p>
              <div className="pt-2 flex gap-2">
                {house.shortlisted && <Badge>Shortlisted</Badge>}
                {house.viewed && <Badge variant="secondary">Viewed</Badge>}
                <Badge variant="outline">{house.decisionStatus}</Badge>
              </div>
              <Link href={house.advertLink} className="inline-block pt-2 text-blue-600 underline">View advert link</Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Comparison table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Distance to school</TableHead><TableHead>Distance to hospital</TableHead><TableHead>Agent</TableHead><TableHead>Contact</TableHead></TableRow></TableHeader>
            <TableBody>
              {housingOptions.map((house) => (
                <TableRow key={house.id}>
                  <TableCell>{house.propertyTitle}</TableCell>
                  <TableCell>{house.distanceToSchool}</TableCell>
                  <TableCell>{house.distanceToHospital}</TableCell>
                  <TableCell>{house.landlordOrAgentName}</TableCell>
                  <TableCell>{house.contactDetails}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
