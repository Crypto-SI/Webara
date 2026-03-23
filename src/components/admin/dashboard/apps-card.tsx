'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Plus, PencilLine } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { APP_STATUS_OPTIONS, type AppStatus } from '@/lib/apps';
import { formatDate, formatTimestamp } from './formatters';
import { LoadingTablePlaceholder } from './placeholders';
import type { AppRow } from './types';

type AppInput = {
  name: string;
  website_url: string;
  supabase_dashboard_url: string;
  description: string;
  status: AppStatus;
  sort_order: number;
};

type AppsCardProps = {
  apps: AppRow[];
  isLoading: boolean;
  onCreateApp: (input: AppInput) => Promise<void>;
  onUpdateApp: (id: string, input: AppInput) => Promise<void>;
};

const statusClasses: Record<AppStatus, string> = {
  active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
  planning: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  archived: 'border-slate-500/40 bg-slate-500/10 text-slate-700',
};

const defaultFormState: AppInput = {
  name: '',
  website_url: '',
  supabase_dashboard_url: '',
  description: '',
  status: 'active',
  sort_order: 0,
};

export function AppsCard({ apps, isLoading, onCreateApp, onUpdateApp }: AppsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppRow | null>(null);
  const [form, setForm] = useState<AppInput>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedApps = useMemo(
    () =>
      [...apps].sort((a, b) =>
        a.sort_order === b.sort_order
          ? a.name.localeCompare(b.name)
          : a.sort_order - b.sort_order
      ),
    [apps]
  );

  useEffect(() => {
    if (!editingApp) {
      setForm(defaultFormState);
      return;
    }

    setForm({
      name: editingApp.name,
      website_url: editingApp.website_url ?? '',
      supabase_dashboard_url: editingApp.supabase_dashboard_url ?? '',
      description: editingApp.description ?? '',
      status: editingApp.status,
      sort_order: editingApp.sort_order,
    });
  }, [editingApp]);

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingApp(null);
      setForm(defaultFormState);
      setError(null);
      setIsSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    setEditingApp(null);
    setForm({
      ...defaultFormState,
      sort_order:
        sortedApps.length > 0
          ? Math.max(...sortedApps.map((app) => app.sort_order)) + 10
          : 10,
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (app: AppRow) => {
    setEditingApp(app);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingApp) {
        await onUpdateApp(editingApp.id, form);
      } else {
        await onCreateApp(form);
      }

      handleDialogChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save app.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="responsive-card">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>APPs</CardTitle>
            <CardDescription>
              Manage the products and projects under the Webara umbrella.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading ? (
              <span className="text-sm text-muted-foreground">
                Last updated {formatTimestamp(new Date())}
              </span>
            ) : null}
            <Button size="sm" onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add App
            </Button>
          </div>
        </CardHeader>
        <CardContent className="table-scroll-x">
          {isLoading ? (
            <LoadingTablePlaceholder rows={5} columns={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Supabase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[110px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      No apps added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Order {app.sort_order}
                          </p>
                          {app.description ? (
                            <p className="max-w-xl text-sm text-muted-foreground">
                              {app.description}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.website_url ? (
                          <a
                            href={app.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                          >
                            Visit
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {app.supabase_dashboard_url ? (
                          <a
                            href={app.supabase_dashboard_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                          >
                            Open dashboard
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">No dashboard</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClasses[app.status]}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(app.updated_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(app)}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingApp ? 'Edit App' : 'Add App'}</DialogTitle>
            <DialogDescription>
              Set the app name, destination website, status, and supporting notes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">App Name</Label>
              <Input
                id="app-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="CaseLens"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-website">Website URL</Label>
              <Input
                id="app-website"
                value={form.website_url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, website_url: event.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-supabase-dashboard">Supabase Dashboard URL</Label>
              <Input
                id="app-supabase-dashboard"
                value={form.supabase_dashboard_url}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    supabase_dashboard_url: event.target.value,
                  }))
                }
                placeholder="https://supabase.com/dashboard/project/your-project-ref"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, status: value as AppStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-order">Sort Order</Label>
                <Input
                  id="app-order"
                  type="number"
                  min={0}
                  value={String(form.sort_order)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: Number.parseInt(event.target.value || '0', 10) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-description">Description</Label>
              <Textarea
                id="app-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Short summary, context, or delivery notes for this app."
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingApp ? 'Save Changes' : 'Create App'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
