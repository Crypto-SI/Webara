import { Filter } from 'lucide-react';
import { RelocationShell } from '@/components/relocation/relocation-shell';
import { StatusChip } from '@/components/relocation/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { documents } from '@/lib/relocation/mock-data';

export default function DocumentsPage() {
  return (
    <RelocationShell title="Documents">
      <Card>
        <CardHeader>
          <CardTitle>Document tracker</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Search by person or reference" />
            <Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All people</SelectItem><SelectItem value="Kwame Mensah">Kwame Mensah</SelectItem><SelectItem value="Ama Mensah">Ama Mensah</SelectItem></SelectContent></Select>
            <Select defaultValue="all-status"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all-status">All status</SelectItem><SelectItem value="not_started">Not started</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="received">Received</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><Filter className="h-4 w-4" />Mock filter controls (frontend only)</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Issue</TableHead><TableHead>Expiry</TableHead><TableHead>Reference</TableHead><TableHead>Original</TableHead><TableHead>Copy</TableHead><TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.person}</TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell><StatusChip value={doc.status} /></TableCell>
                  <TableCell>{doc.issueDate}</TableCell>
                  <TableCell>{doc.expiryDate}</TableCell>
                  <TableCell>{doc.referenceNumber}</TableCell>
                  <TableCell>{doc.originalAvailable ? <Badge>Yes</Badge> : 'No'}</TableCell>
                  <TableCell>{doc.copyAvailable ? <Badge variant="secondary">Yes</Badge> : 'No'}</TableCell>
                  <TableCell className="max-w-44 text-slate-600">{doc.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
