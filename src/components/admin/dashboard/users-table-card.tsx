import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { roleBadgeClasses } from './constants';
import { formatDate, formatTimestamp } from './formatters';
import { LoadingTablePlaceholder } from './placeholders';
import type { ProfileRow } from './types';

type UsersTableCardProps = {
  profiles: ProfileRow[];
  isLoading: boolean;
};

export function UsersTableCard({ profiles, isLoading }: UsersTableCardProps) {
  return (
    <Card className="lg:col-span-2 responsive-card">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>Full list of platform accounts.</CardDescription>
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">
            Last updated {formatTimestamp(new Date())}
          </span>
        )}
      </CardHeader>
      <CardContent className="table-scroll-x">
        {isLoading ? (
          <LoadingTablePlaceholder rows={4} columns={5} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.user_id}>
                  <TableCell className="font-medium">
                    {profile.full_name || profile.email || '—'}
                  </TableCell>
                  <TableCell>{profile.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleBadgeClasses[profile.role || 'user']}>
                      {profile.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(profile.clerk_created_at)}</TableCell>
                  <TableCell>{formatDate(profile.clerk_last_sign_in_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
