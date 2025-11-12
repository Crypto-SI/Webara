import type { Database } from '@/lib/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type BusinessRow = Database['public']['Tables']['businesses']['Row'];
export type QuoteRow = Database['public']['Tables']['quotes']['Row'];

export type AdminOverviewPayload = {
  profiles: ProfileRow[];
  businesses: BusinessRow[];
  quotes: QuoteRow[];
};
