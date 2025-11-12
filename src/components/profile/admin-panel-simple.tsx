'use client';

import type { Database } from '@/lib/database.types';
import { UsersWithProposals } from '@/components/admin/users-with-proposals';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];
type QuoteRow = Database['public']['Tables']['quotes']['Row'];

interface AdminPanelProps {
  users: ProfileRow[];
  businesses: BusinessRow[];
  quotes: QuoteRow[];
  isLoading: boolean;
}

export function AdminPanelSimple({ users, businesses, quotes, isLoading }: AdminPanelProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-600">Admin Panel</h2>
        <p className="text-muted-foreground">
          Manage users, businesses, and collaboration proposals across the platform.
        </p>
      </div>

      <UsersWithProposals 
        users={users}
        businesses={businesses}
        quotes={quotes}
        onQuoteView={() => {}}
      />
    </div>
  );
}
