import type { Database } from '@/lib/database.types';

export type AppRow = Database['public']['Tables']['apps']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type BusinessRow = Database['public']['Tables']['businesses']['Row'];
export type QuoteRow = Database['public']['Tables']['quotes']['Row'];

export type AdminOverviewPayload = {
  apps: AppRow[];
  profiles: ProfileRow[];
  businesses: BusinessRow[];
  quotes: QuoteRow[];
};
