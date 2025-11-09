'use client';

import { useMemo, useState } from 'react';
import type { Database } from '@/lib/database.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Search, Filter, ArrowUpDown } from 'lucide-react';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];
type QuoteRow = Database['public']['Tables']['quotes']['Row'];

type UserWithBusinessAndQuotes = {
  user: ProfileRow;
  business?: BusinessRow;
  quotes: QuoteRow[];
};

const quoteStatusBadgeClasses: Partial<Record<QuoteRow['status'], string>> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  call_requested: 'bg-purple-100 text-purple-700 border-purple-200',
  project_created: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
};

function statusLabel(status: QuoteRow['status']) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'under_review':
      return 'Under Review';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'call_requested':
      return 'Call Requested';
    case 'project_created':
      return 'Project Created';
    case 'draft':
    default:
      return 'Draft';
  }
}

interface UsersWithProposalsProps {
  users: ProfileRow[];
  businesses: BusinessRow[];
  quotes: QuoteRow[];
  onQuoteView: (quote: QuoteRow) => void;
}

export function UsersWithProposals({ users, businesses, quotes, onQuoteView }: UsersWithProposalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'quotes'>('name');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Group data by user
  const usersWithBusinessAndQuotes = useMemo(() => {
    console.log('UsersWithProposals - users:', users);
    console.log('UsersWithProposals - businesses:', businesses);
    console.log('UsersWithProposals - quotes:', quotes);

    const businessByUserId = businesses.reduce<Record<string, BusinessRow>>((acc, business) => {
      acc[business.owner_id] = business;
      return acc;
    }, {});

    const quotesByUserId = quotes.reduce<Record<string, QuoteRow[]>>((acc, quote) => {
      if (!acc[quote.user_id]) {
        acc[quote.user_id] = [];
      }
      acc[quote.user_id].push(quote);
      return acc;
    }, {});

    const result = users
      .map(user => ({
        user,
        business: businessByUserId[user.user_id],
        quotes: quotesByUserId[user.user_id] || [],
      }))
      .filter(userWithQuotes => {
        // Filter by search term
        const matchesSearch =
          userWithQuotes.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userWithQuotes.business?.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userWithQuotes.quotes.some(quote =>
            quote.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        
        // Filter by status
        const matchesStatus = statusFilter === 'all' ||
          userWithQuotes.quotes.some(quote => quote.status === statusFilter);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.user.full_name || '').localeCompare(b.user.full_name || '');
          case 'created':
            return new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime();
          case 'quotes':
            return b.quotes.length - a.quotes.length;
          default:
            return 0;
        }
      });

    console.log('UsersWithProposals - result:', result);
    return result;
  }, [users, businesses, quotes, searchTerm, statusFilter, sortBy]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(quotes.map(quote => quote.status));
    return Array.from(statuses);
  }, [quotes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users & Their Proposals</CardTitle>
        <CardDescription>
          View users grouped with their businesses and collaboration proposals.
        </CardDescription>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users, businesses, or proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {statusLabel(status as QuoteRow['status'])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'quotes') => setSortBy(value)}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="quotes">Number of Quotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {usersWithBusinessAndQuotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No users found matching your criteria.
            </p>
          ) : (
            usersWithBusinessAndQuotes.map(({ user, business, quotes }) => (
              <Card key={user.user_id} className="border-l-4 border-l-blue-500">
                <Collapsible
                  open={expandedUsers.has(user.user_id)}
                  onOpenChange={() => toggleUserExpanded(user.user_id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {user.full_name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {user.phone || 'No phone'}
                            </p>
                          </div>
                          
                          {business && (
                            <div className="text-sm">
                              <p className="font-medium">{business.business_name}</p>
                              <p className="text-muted-foreground">
                                {business.industry} • {business.company_size}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{quotes.length} Proposals</p>
                            <p className="text-xs text-muted-foreground">
                              {quotes.filter(q => ['accepted', 'project_created'].includes(q.status)).length} Active
                            </p>
                          </div>
                          {expandedUsers.has(user.user_id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {quotes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No proposals submitted yet.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Budget</TableHead>
                              <TableHead>Estimated Cost</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Updated</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quotes.map((quote) => (
                              <TableRow key={quote.id}>
                                <TableCell className="font-medium">
                                  {quote.title}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={quoteStatusBadgeClasses[quote.status]}
                                  >
                                    {statusLabel(quote.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{quote.budget_range || '—'}</TableCell>
                                <TableCell>
                                  {quote.estimated_cost
                                    ? `${quote.currency} ${quote.estimated_cost.toLocaleString()}`
                                    : '—'}
                                </TableCell>
                                <TableCell>
                                  {new Date(quote.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {new Date(quote.updated_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onQuoteView(quote)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}