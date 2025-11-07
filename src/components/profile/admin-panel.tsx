'use client';

import { useEffect, useState } from 'react';
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

export function AdminPanel({ users, businesses, quotes, isLoading }: AdminPanelProps) {
  const [adminData, setAdminData] = useState<{ users: ProfileRow[], businesses: BusinessRow[], quotes: QuoteRow[] }>({
    users: [],
    businesses: [],
    quotes: []
  });

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const response = await fetch('/api/admin/overview', {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = await response.json();
          setAdminData({
            users: payload.profiles || [],
            businesses: payload.businesses || [],
            quotes: payload.quotes || []
          });
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    };

    loadAdminData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-600">Admin Panel</h2>
        <p className="text-muted-foreground">
          Manage users, businesses, and collaboration proposals across the platform.
        </p>
      </div>

      <UsersWithProposals
        users={adminData.users}
        businesses={adminData.businesses}
        quotes={adminData.quotes}
      />
    </div>
  );
}