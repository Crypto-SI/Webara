import Link from 'next/link';
import { Plus } from 'lucide-react';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { familyMembers } from '@/lib/relocation/mock-data';

export default function FamilyMembersPage() {
  return (
    <RelocationShell title="Family Members">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Family member directory</CardTitle>
          <Button><Plus className="mr-2 h-4 w-4" />Add family member</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Date of birth</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell>{member.relationship}</TableCell>
                  <TableCell>{member.dateOfBirth}</TableCell>
                  <TableCell className="max-w-xs text-slate-600">{member.notes}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/relocation/family-members/${member.id}`}>View profile</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
