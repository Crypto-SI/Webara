import { notFound } from 'next/navigation';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { documents, familyMembers, healthcareEntries } from '@/lib/relocation/mock-data';
import { StatusChip } from '@/components/relocation/shared';

export default async function FamilyMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = familyMembers.find((item) => item.id === id);

  if (!member) {
    notFound();
  }

  const memberDocuments = documents.filter((doc) => doc.person === member.fullName);
  const memberHealthcare = healthcareEntries.filter((entry) => entry.personName === member.fullName);

  return (
    <RelocationShell title={`${member.fullName} profile`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Profile overview</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-slate-500">Relationship:</span> {member.relationship}</p>
            <p><span className="text-slate-500">Date of birth:</span> {member.dateOfBirth}</p>
            <p><span className="text-slate-500">Notes:</span> {member.notes}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Documents linked</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {memberDocuments.length === 0 ? (
              <p className="text-sm text-slate-500">No document records yet.</p>
            ) : (
              memberDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                  <div>
                    <p className="font-medium">{doc.documentType}</p>
                    <p className="text-slate-500">Ref: {doc.referenceNumber}</p>
                  </div>
                  <StatusChip value={doc.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Healthcare links</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {memberHealthcare.length === 0 ? (
            <p className="text-slate-500">No healthcare entry linked yet.</p>
          ) : (
            memberHealthcare.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium">{entry.doctorName}</p>
                <p className="text-slate-500">{entry.address}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
