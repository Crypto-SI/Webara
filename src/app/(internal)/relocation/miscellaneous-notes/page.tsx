import { RelocationShell } from '@/components/relocation/relocation-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { miscNotes } from '@/lib/relocation/mock-data';
import { relocationTableSchemas } from '@/lib/relocation/schema';

export default function MiscNotesPage() {
  return (
    <RelocationShell title="Miscellaneous Notes">
      <Card>
        <CardHeader>
          <CardTitle>Structured notes</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Search notes" />
            <Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem><SelectItem value="travel">Travel</SelectItem><SelectItem value="schooling">Schooling</SelectItem></SelectContent></Select>
            <Select defaultValue="all-priority"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all-priority">All priorities</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {miscNotes.map((note) => (
            <div key={note.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{note.title}</p>
                <Badge variant="outline">{note.category}</Badge>
                <Badge>{note.priority}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-700">{note.noteBody}</p>
              <p className="mt-2 text-xs text-slate-500">Linked: {note.linkedPerson} • {note.linkedSection} • Added {note.dateAdded}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Future Supabase table mapping</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {relocationTableSchemas.map((schema) => (
            <div key={schema.table} className="rounded-lg border border-slate-200 p-3">
              <p className="font-mono text-sm font-semibold">{schema.table}</p>
              <p className="mt-1 text-xs text-slate-500">{schema.columns.join(' • ')}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </RelocationShell>
  );
}
